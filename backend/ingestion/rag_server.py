from __future__ import annotations

import logging
import os
from threading import Lock
from typing import Dict, Optional

import pathway as pw
from pathway.xpacks.llm import embedders, llms, parsers, question_answering, splitters
from pathway.xpacks.llm.vector_store import VectorStoreServer


logger = logging.getLogger(__name__)
_rag_app: Optional[question_answering.BaseRAGQuestionAnswerer] = None
_rag_status_lock = Lock()
_rag_status: Dict[str, Optional[str] | bool] = {
    "enabled": False,
    "ready": False,
    "error": None,
}


def _set_rag_status(enabled: bool, ready: bool, error: Optional[str]) -> None:
    with _rag_status_lock:
        _rag_status["enabled"] = enabled
        _rag_status["ready"] = ready
        _rag_status["error"] = error


def get_rag_status() -> Dict[str, Optional[str] | bool]:
    with _rag_status_lock:
        return {
            "enabled": bool(_rag_status["enabled"]),
            "ready": bool(_rag_status["ready"]),
            "error": _rag_status["error"],
        }


def _rag_enabled() -> bool:
    raw_value = os.getenv("GREENHEALTH_ENABLE_RAG", "true").strip().lower()
    return raw_value in {"1", "true", "yes", "on"}


def build_rag_qa_server() -> bool:
    """
    Build a Pathway RAG REST server graph within the same runtime as streaming.
    The caller should invoke pw.run() after this function.
    """
    global _rag_app

    if not _rag_enabled():
        _set_rag_status(enabled=False, ready=False, error=None)
        logger.info("RAG startup skipped because GREENHEALTH_ENABLE_RAG is disabled.")
        return False

    docs_dir = os.getenv("GREENHEALTH_DOCS_DIR", "./data/documents")
    docs_pattern = os.getenv("GREENHEALTH_DOC_PATTERN", "*.txt")
    rag_host = os.getenv("GREENHEALTH_RAG_HOST", "127.0.0.1")
    rag_port = int(os.getenv("GREENHEALTH_RAG_PORT", "8765"))
    embed_model = os.getenv(
        "GREENHEALTH_EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2"
    )

    groq_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    groq_api_key = os.getenv("GROQ_API_KEY")
    groq_base_url = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")

    if not groq_api_key:
        error = "GROQ_API_KEY is not set."
        _set_rag_status(enabled=True, ready=False, error=error)
        logger.warning("%s Skipping RAG server startup.", error)
        return False

    if not os.path.isdir(docs_dir):
        error = f"RAG docs directory does not exist: {docs_dir}"
        _set_rag_status(enabled=True, ready=False, error=error)
        logger.warning(
            "%s. Skipping RAG server startup.",
            error,
        )
        return False

    try:
        docs = pw.io.fs.read(
            path=docs_dir,
            format="binary",
            with_metadata=True,
            mode="streaming",
            object_pattern=docs_pattern,
        )
        parser = parsers.Utf8Parser()
        text_splitter = splitters.TokenCountSplitter(max_tokens=400)
        embedder = embedders.SentenceTransformerEmbedder(
            model=embed_model,
            device="cpu",
        )
        vector_server = VectorStoreServer(
            docs,
            embedder=embedder,
            parser=parser,
            splitter=text_splitter,
        )
        chat = llms.OpenAIChat(
            model=groq_model,
            api_key=groq_api_key,
            base_url=groq_base_url,
            temperature=0.2,
        )
        _rag_app = question_answering.BaseRAGQuestionAnswerer(
            llm=chat,
            indexer=vector_server,
            search_topk=4,
        )
        _rag_app.build_server(host=rag_host, port=rag_port)

        logger.info(
            "RAG server graph initialized on http://%s:%d using docs at %s (pattern=%s)",
            rag_host,
            rag_port,
            docs_dir,
            docs_pattern,
        )
        _set_rag_status(enabled=True, ready=True, error=None)
        return True
    except Exception as exc:
        _set_rag_status(enabled=True, ready=False, error=str(exc))
        logger.exception("Failed to initialize Pathway RAG server graph.")
        _rag_app = None
        return False
