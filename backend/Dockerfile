FROM python:3.12-slim

# Install ffmpeg and clean apt cache
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -r -u 10001 -m -s /bin/bash appuser

WORKDIR /app

# Copy dependency definition and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create temp storage directory owned by appuser
RUN mkdir -p /app/temp && chown -R appuser:appuser /app

# Copy application code
COPY app ./app

USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
