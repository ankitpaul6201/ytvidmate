FROM python:3.12-slim

# Install ffmpeg, nodejs, curl, ca-certificates, and clean apt cache
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    nodejs \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Download pre-built bgutil-pot binary for Linux x86_64
RUN curl -fsSL -o /usr/local/bin/bgutil-pot \
    https://github.com/jim60105/bgutil-ytdlp-pot-provider-rs/releases/download/v0.8.1/bgutil-pot-linux-x86_64 \
    && chmod +x /usr/local/bin/bgutil-pot

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
