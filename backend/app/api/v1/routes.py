import os
import shutil
from typing import Annotated

import yt_dlp
from fastapi import (
    APIRouter,
    Cookie,
    HTTPException,
    Query,
    Request,
    Response,
    status,
)
from fastapi.responses import FileResponse, StreamingResponse

from app.core.rate_limit import hash_ip, is_rate_limited
from app.core.security import validate_public_url
from app.core.tokens import generate_job_token, verify_job_token
from app.core.turnstile import verify_turnstile_token
from app.schemas.media import DownloadRequest, InfoRequest, MediaInfoResponse
from app.services.job_manager import job_manager
from app.services.ytdlp_service import YtDlpServiceError, extract_media_info

router = APIRouter(prefix="/api/v1", tags=["Media Downloader"])


def get_client_ip(request: Request) -> str:
    """Extracts client IP safely, accounting for proxies."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


@router.get("/health")
def health():
    ffmpeg_path = shutil.which("ffmpeg")
    return {
        "status": "healthy",
        "service": "ytvidmate-backend",
        "ytdlp_version": yt_dlp.version.__version__,
        "ffmpeg_installed": ffmpeg_path is not None,
    }


@router.post("/info", response_model=MediaInfoResponse)
def get_media_info(payload: InfoRequest, request: Request):
    client_ip = get_client_ip(request)
    hashed = hash_ip(client_ip)

    if is_rate_limited(hashed, "info"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit reached. Please wait a few minutes before trying again.",
        )

    try:
        clean_url = validate_public_url(payload.url)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e

    try:
        return extract_media_info(clean_url)
    except YtDlpServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.user_message,
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve video information. Please try again.",
        ) from e


@router.post("/download")
async def start_download(
    payload: DownloadRequest, request: Request, response: Response
):
    client_ip = get_client_ip(request)
    hashed = hash_ip(client_ip)

    if is_rate_limited(hashed, "download"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Download limit reached. Please wait before downloading again.",
        )

    valid_captcha = await verify_turnstile_token(
        payload.turnstile_token, client_ip
    )
    if not valid_captcha:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Security check failed. Please refresh and try again.",
        )

    try:
        clean_url = validate_public_url(payload.url)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e

    job = job_manager.create_job(
        url=clean_url,
        height=payload.height,
        media_type=payload.type,
    )

    token = generate_job_token(job.job_id)

    # Set Secure SameSite=Strict HttpOnly cookie with signed job token
    response.set_cookie(
        key=f"job_token_{job.job_id}",
        value=token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=3600,
    )

    return {
        "job_id": job.job_id,
        "token": token,
    }


@router.get("/progress/{job_id}")
async def get_progress(
    job_id: str,
    token: Annotated[str | None, Query()] = None,
    job_token_cookie: Annotated[str | None, Cookie(alias="job_token")] = None,
):
    valid_token = token or job_token_cookie
    if not valid_token or not verify_job_token(job_id, valid_token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing job token.",
        )

    return StreamingResponse(
        job_manager.stream_progress(job_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/file/{job_id}")
def download_file(
    job_id: str,
    token: Annotated[str | None, Query()] = None,
    job_token_cookie: Annotated[str | None, Cookie(alias="job_token")] = None,
):
    valid_token = token or job_token_cookie
    if not valid_token or not verify_job_token(job_id, valid_token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing job access token.",
        )

    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="File has expired or does not exist.",
        )

    if job.status != "done" or not job.file_path or not os.path.exists(job.file_path):
        if job.status == "error":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=job.error or "Download failed",
            )
        raise HTTPException(
            status_code=status.HTTP_202_ACCEPTED,
            detail="File is still processing.",
        )

    media_type = "audio/mpeg" if job.media_type == "audio" else "video/mp4"

    safe_filename = job.filename or "video.mp4"
    return FileResponse(
        path=job.file_path,
        media_type=media_type,
        filename=safe_filename,
        headers={
            "Content-Disposition": f'attachment; filename="{safe_filename}"',
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "private, no-store",
        },
    )
