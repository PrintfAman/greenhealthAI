FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    curl \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./

ARG PIP_INDEX_URL=https://pypi.org/simple
ARG PIP_EXTRA_INDEX_URL=https://download.pytorch.org/whl/cpu
ENV PIP_INDEX_URL=${PIP_INDEX_URL}
ENV PIP_EXTRA_INDEX_URL=${PIP_EXTRA_INDEX_URL}

RUN pip install --upgrade pip \
 && pip install "setuptools<81" \
 && pip install --retries 20 --resume-retries 20 --timeout 180 -r requirements.txt

COPY backend/ ./

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
 CMD curl -f http://localhost:8000/healthz || exit 1

CMD ["sh", "-c", "uvicorn main:app --host ${UVICORN_HOST:-0.0.0.0} --port ${UVICORN_PORT:-8000} --log-level ${LOG_LEVEL:-info}"]
