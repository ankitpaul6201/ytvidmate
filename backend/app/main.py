import shutil

import yt_dlp
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes import router as api_v1_router
from app.core.config import settings

app = FastAPI(
    title="YTVidMate API",
    version="1.0.0",
    docs_url=None if settings.app_env == "production" else "/docs",
    redoc_url=None,
    openapi_url=None if settings.app_env == "production" else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.middleware("http")
async def log_requests(request, call_next):
    print(f"[YTVidMate API] >>> {request.method} {request.url.path}")
    response = await call_next(request)
    print(f"[YTVidMate API] <<< {request.method} {request.url.path} -> {response.status_code}")
    return response


app.include_router(api_v1_router)


@app.get("/")
def root():
    return {
        "service": "ytvidmate-backend",
        "status": "online",
        "version": "1.0.0",
    }


@app.get("/api/v1/health")
def health_check():
    ffmpeg_path = shutil.which("ffmpeg")
    return {
        "status": "healthy",
        "service": "ytvidmate-backend",
        "ytdlp_version": yt_dlp.version.__version__,
        "ffmpeg_installed": ffmpeg_path is not None,
    }
