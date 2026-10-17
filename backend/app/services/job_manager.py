import json
import logging
import os
import shutil
import threading
import time
import uuid
from collections.abc import AsyncGenerator
from typing import Any

from app.core.config import settings
from app.core.security import safe_job_path
from app.services.ytdlp_service import YtDlpServiceError, download_media

logger = logging.getLogger(__name__)

JOB_TTL_SECONDS = 1800  # 30 minutes


class Job:
    def __init__(self, job_id: str, url: str, height: int, media_type: str):
        self.job_id = job_id
        self.url = url
        self.height = height
        self.media_type = media_type
        self.status = "queued"
        self.percent = 0.0
        self.speed = ""
        self.eta: int | None = None
        self.file_path: str | None = None
        self.filename: str | None = None
        self.error: str | None = None
        self.created_at = time.time()
        self.completed_at: float | None = None

    def to_event_data(self) -> dict[str, Any]:
        return {
            "status": self.status,
            "percent": self.percent,
            "speed": self.speed,
            "eta": self.eta,
            "error": self.error,
        }


class JobManager:
    def __init__(self):
        self._jobs: dict[str, Job] = {}
        self._lock = threading.Lock()
        self._cleanup_lock = threading.Lock()

    def create_job(self, url: str, height: int, media_type: str) -> Job:
        job_id = str(uuid.uuid4())
        job = Job(job_id=job_id, url=url, height=height, media_type=media_type)
        with self._lock:
            self._jobs[job_id] = job

        # Start execution in background daemon thread
        thread = threading.Thread(
            target=self._run_job, args=(job,), daemon=True
        )
        thread.start()
        return job

    def get_job(self, job_id: str) -> Job | None:
        self.cleanup_expired_jobs()
        with self._lock:
            return self._jobs.get(job_id)

    def _run_job(self, job: Job):
        job_dir = os.path.join(settings.tmp_dir, job.job_id)
        os.makedirs(job_dir, exist_ok=True)

        job.status = "downloading"
        job.percent = 1.0

        def on_progress(p: dict[str, Any]):
            job.status = p.get("status", "downloading")
            job.percent = p.get("percent", 0.0)
            job.speed = p.get("speed", "")
            job.eta = p.get("eta")

        try:
            filename = download_media(
                url=job.url,
                target_dir=job_dir,
                height=job.height,
                media_type=job.media_type,
                progress_callback=on_progress,
            )

            # Locate downloaded file in job_dir
            downloaded_file = safe_job_path(settings.tmp_dir, job.job_id, filename)
            if not os.path.exists(downloaded_file):
                # Search job_dir for any matching media file if name differed
                candidates = [
                    f
                    for f in os.listdir(job_dir)
                    if f.endswith((".mp4", ".mp3", ".webm", ".m4a"))
                ]
                if candidates:
                    downloaded_file = os.path.join(job_dir, candidates[0])
                    filename = candidates[0]
                else:
                    raise FileNotFoundError("Output file could not be located")

            job.status = "done"
            job.percent = 100.0
            job.file_path = downloaded_file
            job.filename = filename
            job.completed_at = time.time()
            logger.info(f"Job {job.job_id} completed successfully: {filename}")

        except YtDlpServiceError as e:
            logger.warning(f"Job {job.job_id} failed: {e}")
            job.status = "error"
            job.error = e.user_message
        except Exception as e:
            logger.error(f"Job {job.job_id} unexpected failure: {e}", exc_info=True)
            job.status = "error"
            job.error = "An error occurred while processing the download."

    async def stream_progress(self, job_id: str) -> AsyncGenerator[str, None]:
        """Generates Server-Sent Events (SSE) for job progress."""
        last_percent = -1.0
        last_status = ""

        while True:
            job = self.get_job(job_id)
            if not job:
                err_data = json.dumps(
                    {"status": "expired", "error": "Job expired or not found"}
                )
                yield f"data: {err_data}\n\n"
                break

            # Send update if state changed
            if job.percent != last_percent or job.status != last_status:
                data = json.dumps(job.to_event_data())
                yield f"data: {data}\n\n"
                last_percent = job.percent
                last_status = job.status

            if job.status in ("done", "error"):
                break

            import asyncio
            await asyncio.sleep(0.5)

    def cleanup_expired_jobs(self):
        """Removes jobs and their temporary disk folders after 30 minutes."""
        now = time.time()
        to_delete: list[str] = []

        with self._cleanup_lock:
            for job_id, job in list(self._jobs.items()):
                ref_time = job.completed_at or job.created_at
                if now - ref_time > JOB_TTL_SECONDS:
                    to_delete.append(job_id)

            for job_id in to_delete:
                with self._lock:
                    if job_id in self._jobs:
                        del self._jobs[job_id]

                job_dir = os.path.join(settings.tmp_dir, job_id)
                if os.path.exists(job_dir):
                    try:
                        shutil.rmtree(job_dir, ignore_errors=True)
                        logger.info(f"Cleaned up expired job directory: {job_dir}")
                    except Exception as e:
                        logger.error(f"Failed to delete {job_dir}: {e}")


job_manager = JobManager()
