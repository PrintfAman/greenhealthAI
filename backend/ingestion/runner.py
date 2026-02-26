from __future__ import annotations

import pathway as pw

from transforms.pipeline import build_streaming_graph
from ingestion.rag_server import build_rag_qa_server


def main() -> None:
    """
    Entry point for the Pathway streaming engine.

    Run this as a separate process/container from the FastAPI app to keep
    streaming concerns isolated from the API layer:

        python -m ingestion.runner
    """
    build_streaming_graph()
    build_rag_qa_server()
    pw.run()


if __name__ == "__main__":
    main()

