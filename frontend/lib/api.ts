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
  // In the browser, use relative paths so Next.js rewrites proxy to backend with zero CORS issues
  if (typeof window !== "undefined") {
    return "";
  }
  return "http://127.0.0.1:8000";
}

export async function fetchMediaInfo(url: string): Promise<MediaInfoResponse> {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/api/v1/info`;
  console.log("[YTVidMate] Requesting video details for:", url, "via:", endpoint || "/api/v1/info");

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
  } catch (err: unknown) {
    console.error("[YTVidMate] Network connection failed:", err);
    throw new Error(
      `Cannot connect to backend server. Please verify that FastAPI is running on port 8000.`
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
    console.warn("[YTVidMate] Backend error:", errorMsg);
    throw new Error(errorMsg);
  }

  const data = await res.json();
  console.log("[YTVidMate] Successfully fetched video details:", data.title);
  return data;
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
    console.error("[YTVidMate] Start download connection failed:", err);
    throw new Error(
      `Cannot connect to backend server. Please verify that FastAPI is running on port 8000.`
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
