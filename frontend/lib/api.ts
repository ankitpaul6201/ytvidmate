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
  const cleanUrl = url ? url.trim() : "";
  if (!cleanUrl) {
    throw new Error("Please enter or paste a valid video URL.");
  }

  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/api/v1/info`;
  console.log("[YTVidMate] Requesting video details for:", cleanUrl, "via:", endpoint || "/api/v1/info");

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: cleanUrl }),
    });
  } catch (err: unknown) {
    console.error("[YTVidMate] Network connection failed:", err);
    throw new Error(
      `Cannot connect to backend server. Please verify that FastAPI is running on port 8000.`
    );
  }

  if (!res.ok) {
    let errorMsg = "Please enter or paste a valid video URL.";
    try {
      const errData = await res.json();
      if (typeof errData.detail === "string") {
        errorMsg = errData.detail;
      } else if (Array.isArray(errData.detail) && errData.detail.length > 0) {
        errorMsg =
          errData.detail[0]?.msg?.replace(/^Value error,\s*/i, "") ||
          "Please enter or paste a valid video URL.";
      } else if (errData.error) {
        errorMsg = String(errData.error);
      }
    } catch {
      // fallback
    }

    const lower = errorMsg.toLowerCase();
    if (
      res.status === 422 ||
      (res.status === 400 &&
        (lower.includes("hostname") ||
          lower.includes("resolv") ||
          lower.includes("scheme") ||
          lower.includes("url") ||
          lower.includes("field required") ||
          lower.includes("unprocessable")))
    ) {
      errorMsg = "Please enter or paste a valid video URL.";
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
      if (typeof errData.detail === "string") {
        errorMsg = errData.detail;
      } else if (Array.isArray(errData.detail) && errData.detail.length > 0) {
        errorMsg =
          errData.detail[0]?.msg?.replace(/^Value error,\s*/i, "") ||
          "Failed to start download.";
      } else if (errData.error) {
        errorMsg = String(errData.error);
      }
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
  let baseUrl = getApiBaseUrl();
  if (!baseUrl && typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isLocalhost) {
      baseUrl = `http://${window.location.hostname}:8000`;
    }
  }
  return `${baseUrl}/api/v1/progress/${encodeURIComponent(jobId)}?token=${encodeURIComponent(token)}`;
}

export function getFileDownloadUrl(jobId: string, token: string): string {
  let baseUrl = getApiBaseUrl();
  if (!baseUrl && typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isLocalhost) {
      baseUrl = `http://${window.location.hostname}:8000`;
    }
  }
  return `${baseUrl}/api/v1/file/${encodeURIComponent(jobId)}?token=${encodeURIComponent(token)}`;
}
