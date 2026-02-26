FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONPATH=/app

WORKDIR /app

COPY backend/requirements.txt ./requirements.txt

ARG PIP_INDEX_URL=https://pypi.org/simple
ARG PIP_EXTRA_INDEX_URL=https://download.pytorch.org/whl/cpu
ENV PIP_INDEX_URL=${PIP_INDEX_URL}
ENV PIP_EXTRA_INDEX_URL=${PIP_EXTRA_INDEX_URL}

RUN pip install --upgrade pip "setuptools<81" wheel \
 && pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu --extra-index-url https://pypi.org/simple \
    torch==2.10.0+cpu \
 && pip install --no-cache-dir --retries 20 --resume-retries 20 --timeout 180 -r requirements.txt \
 && pip uninstall -y torchvision opencv-python rapidocr pypdfium2 \
 && find /usr/local/lib/python3.11/site-packages -type d -name "__pycache__" -prune -exec rm -rf {} + \
 && find /usr/local/lib/python3.11/site-packages -type d \( -name "tests" -o -name "test" \) -prune -exec rm -rf {} + \
 && find /usr/local/lib/python3.11/site-packages -type f -name "*.pyc" -delete \
 && find /usr/local/lib/python3.11/site-packages -type f -name "*.a" -delete \
 && rm -rf /usr/local/lib/python3.11/site-packages/torch/include \
 && rm -rf /usr/local/lib/python3.11/site-packages/torch/share

COPY backend/ ./

EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
 CMD python -c "import os,urllib.request;urllib.request.urlopen(f'http://127.0.0.1:{os.getenv(\"UVICORN_PORT\", os.getenv(\"PORT\", \"10000\"))}/livez', timeout=5)"

CMD ["sh", "-c", "APP_PORT=${UVICORN_PORT:-${PORT:-10000}}; uvicorn main:app --host ${UVICORN_HOST:-0.0.0.0} --port ${APP_PORT} --log-level ${LOG_LEVEL:-info}"]
