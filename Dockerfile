# FastAPI + LangGraph orchestration layer. Holds NO economic private key.
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY run_tests.py pytest.py ./
COPY tests ./tests

ENV ENVIRONMENT=production
ENV USE_MOCK_PAYMENTS=false
ENV ALLOW_LOCAL_PROVIDER=false
ENV PORT=8000

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
