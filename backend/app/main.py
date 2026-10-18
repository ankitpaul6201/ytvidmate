import yt_dlp
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.routes import router as api_v1_router
from app.core.config import settings
from app.services.ffmpeg_service import find_ffmpeg_path, is_ffmpeg_available
from app.services.job_manager import JobQueueFullError

# Initialize and register FFmpeg path if found in local installations
find_ffmpeg_path()

app = FastAPI(
    title="YTVidMate API",
    version="1.0.0",
    docs_url=None if settings.app_env == "production" else "/docs",
    redoc_url=None,
    openapi_url=None if settings.app_env == "production" else "/openapi.json",
)

# CORS: supports local dev, explicit production origins, and regex for Vercel/Render deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_origin_regex=r"^https://.*(\.vercel\.app|\.onrender\.com)$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "HEAD", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
)


@app.exception_handler(JobQueueFullError)
async def queue_full_handler(request: Request, exc: JobQueueFullError):
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"detail": exc.user_message},
        headers={"Retry-After": "60"},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_msg = "Please enter or paste a valid video URL."
    try:
        errors = exc.errors()
        if errors and len(errors) > 0:
            first_msg = errors[0].get("msg", "")
            if "Value error," in first_msg:
                error_msg = first_msg.replace("Value error,", "").strip()
    except Exception:
        pass
    status_code = getattr(
        status, "HTTP_422_UNPROCESSABLE_CONTENT", status.HTTP_422_UNPROCESSABLE_ENTITY
    )
    return JSONResponse(
        status_code=status_code,
        content={"detail": error_msg},
    )


@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Suppress health check logging to keep cloud logs uncluttered from UptimeRobot pings
    is_health = request.url.path in ("/health", "/api/v1/health", "/", "/favicon.ico")
    if not is_health:
        print(f"[YTVidMate API] >>> {request.method} {request.url.path}")

    response = await call_next(request)

    if not is_health:
        print(
            f"[YTVidMate API] <<< {request.method} {request.url.path} -> {response.status_code}"
        )
    return response


app.include_router(api_v1_router)


# Root & UptimeRobot Keep-Alive Endpoints (supports GET & HEAD)
@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {
        "service": "ytvidmate-backend",
        "status": "online",
        "version": "1.0.0",
    }


@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {
        "status": "healthy",
        "service": "ytvidmate-backend",
        "ffmpeg_installed": is_ffmpeg_available(),
    }


@app.api_route("/api/v1/health", methods=["GET", "HEAD"])
def health_v1():
    return {
        "status": "healthy",
        "service": "ytvidmate-backend",
        "ytdlp_version": yt_dlp.version.__version__,
        "ffmpeg_installed": is_ffmpeg_available(),
    }
