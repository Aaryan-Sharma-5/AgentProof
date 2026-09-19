# FastAPI + LangGraph orchestration layer.
#
# Holds NO economic private key. It orchestrates the canonical TypeScript agent service over HTTP
# and can prevent a run from starting, but can never authorize a payment or a settlement.

FROM python:3.12-slim

WORKDIR /app

# Dependencies first so they cache independently of application changes.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code only. Tests and the local test runner are deliberately excluded from the
# runtime image, and no .env is ever copied in (see .dockerignore).
COPY app ./app

# Safe production defaults. Render overrides PORT; the rest are re-stated in render.yaml.
ENV ENVIRONMENT=production \
    USE_MOCK_PAYMENTS=false \
    ALLOW_LOCAL_PROVIDER=false \
    DEBUG=false \
    PYTHONUNBUFFERED=1 \
    PORT=8000

EXPOSE 8000

# Production server: no --reload, binds all interfaces, honours the platform's $PORT.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
