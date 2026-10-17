from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class FormatOption(BaseModel):
    model_config = ConfigDict(extra="forbid")

    format_id: str
    label: str
    height: int | None = None
    ext: str = "mp4"
    filesize_approx: int | None = None
    audio_only: bool = False


class MediaInfoResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    title: str
    thumbnail: str | None = None
    duration: int | None = None
    uploader: str | None = None
    formats: list[FormatOption]


class InfoRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    url: str = Field(..., max_length=2048)


class DownloadRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    url: str = Field(..., max_length=2048)
    height: int = Field(default=1080)
    type: Literal["video", "audio"] = "video"
    turnstile_token: str | None = None
