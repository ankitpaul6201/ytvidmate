export interface FormatOption {
  format_id: string;
  label: string;
  height?: number | null;
  ext: string;
  filesize_approx?: number | null;
  audio_only: boolean;
}

export interface MediaInfoResponse {
  id: string;
  title: string;
  thumbnail?: string | null;
  duration?: number | null;
  uploader?: string | null;
  formats: FormatOption[];
}

export interface DownloadResponse {
  job_id: string;
  token: string;
}

export interface ProgressEventData {
  status: "queued" | "downloading" | "merging" | "done" | "error" | "expired";
  percent: number;
  speed: string;
  eta: number | null;
  error?: string | null;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function fetchMediaInfo(url: string): Promise<MediaInfoResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/info`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    let errorMsg = "Failed to fetch video details.";
    try {
      const errData = await res.json();
      errorMsg = errData.detail || errorMsg;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export async function startDownload(
  url: string,
  height: number,
  type: "video" | "audio"
): Promise<DownloadResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/download`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, height, type }),
  });

  if (!res.ok) {
    let errorMsg = "Failed to start download.";
    try {
      const errData = await res.json();
      errorMsg = errData.detail || errorMsg;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export function getProgressEventSourceUrl(
  jobId: string,
  token: string
): string {
  return `${API_BASE_URL}/api/v1/progress/${encodeURIComponent(jobId)}?token=${encodeURIComponent(token)}`;
}

export function getFileDownloadUrl(jobId: string, token: string): string {
  return `${API_BASE_URL}/api/v1/file/${encodeURIComponent(jobId)}?token=${encodeURIComponent(token)}`;
}
