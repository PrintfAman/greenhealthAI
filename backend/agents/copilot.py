from __future__ import annotations

import asyncio
import os
from typing import Any, List, Optional, Tuple


class SustainabilityCopilot:
    """
    Thin wrapper around Pathway LLM xPack RAG pipeline.

    This class builds (or connects to) a Pathway document index and exposes
    an async-friendly method for answering questions that combine live metrics
    with indexed sustainability policies and compliance documents.
    """

    def __init__(
        self,
        groq_api_key: Optional[str],
        model: str = "llama-3.3-70b-versatile",
        base_url: str = "https://api.groq.com/openai/v1",
    ):
        self.groq_api_key = groq_api_key
        self.model = model
        self.base_url = base_url
        self._rag_no_answer = os.getenv(
            "GREENHEALTH_RAG_NO_ANSWER", "No information found."
        ).strip()
        self._require_rag = self._env_truthy(
            os.getenv("GREENHEALTH_REQUIRE_RAG", "true")
        )
        self._startup_error: Optional[str] = None
        self._ensure_env()
        self._rag_client = self._build_rag_client()

    def _ensure_env(self) -> None:
        """
        Pathway's LLM client uses OpenAI-compatible env vars.
        We set defaults so Groq works without leaking keys into code.
        """
        if self.groq_api_key:
            os.environ.setdefault("GROQ_API_KEY", self.groq_api_key)
            os.environ.setdefault("OPENAI_API_KEY", self.groq_api_key)

        if self.base_url:
            os.environ.setdefault("OPENAI_BASE_URL", self.base_url)
            os.environ.setdefault("OPENAI_API_BASE", self.base_url)

    def _build_rag_client(self) -> Optional[Any]:
        rag_url = os.getenv("GREENHEALTH_RAG_URL")
        if not rag_url:
            rag_host = os.getenv("GREENHEALTH_RAG_HOST", "127.0.0.1")
            rag_port = os.getenv("GREENHEALTH_RAG_PORT", "8765")
            rag_url = f"http://{rag_host}:{rag_port}"

        try:
            from pathway.xpacks.llm.question_answering import RAGClient
        except Exception as exc:  # pragma: no cover - depends on image deps
            self._startup_error = str(exc)
            return None

        try:
            return RAGClient(url=rag_url, timeout=90)
        except Exception as exc:  # pragma: no cover - runtime environment issue
            self._startup_error = str(exc)
            return None

    async def answer_question(
        self,
        question: str,
        department: Optional[str] = None,
        live_context: Optional[str] = None,
    ) -> Tuple[str, List[str]]:
        enriched_question = self._build_enriched_question(
            question=question,
            department=department,
            live_context=live_context,
        )

        rag_answer = await self._answer_with_rag(enriched_question)
        if rag_answer is not None:
            return rag_answer

        if self._require_rag:
            reason = self._startup_error or "RAG backend unavailable or no answer returned."
            return (
                "Copilot is temporarily unavailable because GREENHEALTH_REQUIRE_RAG "
                f"is enabled. Details: {reason}",
                [],
            )

        return await self._answer_with_llm(enriched_question)

    def get_runtime_status(self) -> dict:
        return {
            "rag_required": self._require_rag,
            "rag_client_ready": self._rag_client is not None,
            "startup_error": self._startup_error,
        }

    async def _answer_with_rag(self, question: str) -> Optional[Tuple[str, List[str]]]:
        if self._rag_client is None:
            return None

        try:
            result = await asyncio.to_thread(
                self._rag_client.answer,
                prompt=question,
                model=self.model,
                return_context_docs=True,
            )
        except Exception as exc:
            self._startup_error = str(exc)
            return None

        answer = self._extract_rag_answer(result)
        if not answer:
            return None

        if self._is_no_answer(answer):
            if self._require_rag:
                return answer, self._extract_rag_sources(result)
            return None

        return answer, self._extract_rag_sources(result)

    @staticmethod
    def _env_truthy(raw_value: str) -> bool:
        return raw_value.strip().lower() in {"1", "true", "yes", "on"}

    def _build_enriched_question(
        self,
        question: str,
        department: Optional[str],
        live_context: Optional[str],
    ) -> str:
        parts: List[str] = []
        if department:
            parts.append(f"Department focus: {department}")
        if live_context:
            parts.append(f"Live telemetry snapshot:\n{live_context}")
        parts.append(f"User question: {question}")
        return "\n\n".join(parts)

    def _is_no_answer(self, answer: str) -> bool:
        normalized = answer.strip().lower().rstrip(".")
        configured = self._rag_no_answer.lower().rstrip(".")
        return normalized == configured

    async def _answer_with_llm(self, question: str) -> Tuple[str, List[str]]:
        try:
            from litellm import acompletion
        except Exception as exc:
            reason = self._startup_error or str(exc)
            return (
                "Copilot is temporarily unavailable. LLM client could not be "
                f"initialized. Details: {reason}",
                [],
            )

        try:
            response = await acompletion(
                model=self.model,
                api_key=self.groq_api_key,
                base_url=self.base_url,
                temperature=0.2,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a healthcare sustainability copilot. "
                            "Give concise, practical recommendations."
                        ),
                    },
                    {"role": "user", "content": question},
                ],
            )
            answer = self._extract_completion_text(response)
            if answer:
                return answer, []
            return (
                "Copilot is temporarily unavailable. The language model "
                "returned an empty response.",
                [],
            )
        except Exception as exc:
            reason = self._startup_error or str(exc)
            return (
                "Copilot is temporarily unavailable. The model call failed. "
                f"Details: {reason}",
                [],
            )

    @staticmethod
    def _extract_completion_text(response: Any) -> str:
        choices = getattr(response, "choices", None)
        if choices is None and isinstance(response, dict):
            choices = response.get("choices")
        if not choices:
            return ""

        first_choice = choices[0]
        message = getattr(first_choice, "message", None)
        if message is None and isinstance(first_choice, dict):
            message = first_choice.get("message")
        if message is None:
            return ""

        content = getattr(message, "content", None)
        if content is None and isinstance(message, dict):
            content = message.get("content")
        if isinstance(content, list):
            return "".join(
                part.get("text", "")
                for part in content
                if isinstance(part, dict) and "text" in part
            ).strip()
        if isinstance(content, str):
            return content.strip()
        return ""

    @staticmethod
    def _extract_rag_answer(payload: Any) -> str:
        if not isinstance(payload, dict):
            return ""
        response = payload.get("response") or payload.get("answer")
        if isinstance(response, str):
            return response.strip()
        return ""

    @staticmethod
    def _extract_rag_sources(payload: Any) -> List[str]:
        if not isinstance(payload, dict):
            return []

        context_docs = payload.get("context_docs")
        if not isinstance(context_docs, list):
            return []

        seen = set()
        sources: List[str] = []
        for doc in context_docs:
            if not isinstance(doc, dict):
                continue

            source = SustainabilityCopilot._pick_source(doc)
            if source and source not in seen:
                sources.append(source)
                seen.add(source)

        return sources

    @staticmethod
    def _pick_source(doc: dict) -> Optional[str]:
        direct_keys = ("path", "source", "filepath", "file")
        for key in direct_keys:
            value = doc.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()

        metadata = doc.get("metadata")
        if isinstance(metadata, dict):
            for key in direct_keys:
                value = metadata.get(key)
                if isinstance(value, str) and value.strip():
                    return value.strip()

        return None

