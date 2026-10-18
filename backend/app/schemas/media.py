from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


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
    duration: int | float | None = None
    uploader: str | None = None
    formats: list[FormatOption]


def _validate_raw_url(v: str) -> str:
    clean = v.strip() if isinstance(v, str) else ""
    if not clean or len(clean) < 4:
        raise ValueError("Please enter or paste a valid video URL.")
    host_candidate = clean.replace("https://", "").replace("http://", "").split("/")[0].split("?")[0]
    if " " in host_candidate or ("." not in host_candidate and host_candidate.lower() != "localhost"):
        raise ValueError("Please enter or paste a valid video URL.")
    return clean


class InfoRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    url: str = Field(..., min_length=4, max_length=2048)

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        return _validate_raw_url(v)


class DownloadRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    url: str = Field(..., min_length=4, max_length=2048)
    height: int = Field(default=1080)
    type: Literal["video", "audio"] = "video"
    turnstile_token: str | None = None

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        return _validate_raw_url(v)
