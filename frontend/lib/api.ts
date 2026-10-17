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

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
}

export async function fetchMediaInfo(url: string): Promise<MediaInfoResponse> {
  const baseUrl = getApiBaseUrl();
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/v1/info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
  } catch (err: unknown) {
    throw new Error(
      `Cannot connect to backend server at ${baseUrl}. Please make sure the FastAPI backend is running on port 8000.`
    );
  }

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
  const baseUrl = getApiBaseUrl();
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/v1/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, height, type }),
    });
  } catch (err: unknown) {
    throw new Error(
      `Cannot connect to backend server at ${baseUrl}. Please make sure the FastAPI backend is running on port 8000.`
    );
  }

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
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api/v1/progress/${encodeURIComponent(jobId)}?token=${encodeURIComponent(token)}`;
}

export function getFileDownloadUrl(jobId: string, token: string): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api/v1/file/${encodeURIComponent(jobId)}?token=${encodeURIComponent(token)}`;
}
