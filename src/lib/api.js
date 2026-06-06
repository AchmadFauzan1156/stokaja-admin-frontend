const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Helper: ambil access token dari localStorage
 */
function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

/**
 * Helper: ambil refresh token dari localStorage
 */
function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

/**
 * Helper: simpan token baru
 */
function setTokens(accessToken, refreshToken) {
  localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
}

/**
 * Helper: hapus semua token (logout)
 */
function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

/**
 * Coba refresh access token menggunakan refresh token
 */
async function tryRefreshToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();
    if (data.success && data.data) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return data.data.accessToken;
    }

    clearTokens();
    return null;
  } catch {
    clearTokens();
    return null;
  }
}

/**
 * Fetch wrapper utama. Otomatis:
 * - Attach Authorization header
 * - Retry 1x jika 401 (auto refresh token)
 * - Return parsed JSON
 */
export async function apiFetch(endpoint, options = {}) {
  const token = getAccessToken();

  const headers = { ...options.headers };

  // Jangan set Content-Type jika mengirim FormData (browser set otomatis dengan boundary)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  // Auto refresh token jika 401
  if (res.status === 401 && token) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        cache: "no-store",
      });
    }
  }

  // Parse response
  const contentType = res.headers.get("content-type") || "";

  // Untuk file download (Excel, PDF), return blob
  if (
    contentType.includes("application/pdf") ||
    contentType.includes("spreadsheetml")
  ) {
    if (!res.ok) throw new Error("Gagal mengunduh file");
    return { ok: true, blob: await res.blob() };
  }

  const data = await res.json();

  if (!res.ok) {
    const errorMsg =
      data.pesan || data.message || data.errors?.[0]?.msg || "Terjadi kesalahan";
    const error = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// --- Shorthand methods ---

export function apiGet(endpoint) {
  return apiFetch(endpoint, { method: "GET" });
}

export function apiPost(endpoint, body) {
  const isFormData = body instanceof FormData;
  return apiFetch(endpoint, {
    method: "POST",
    body: isFormData ? body : JSON.stringify(body),
  });
}

export function apiPut(endpoint, body) {
  const isFormData = body instanceof FormData;
  return apiFetch(endpoint, {
    method: "PUT",
    body: isFormData ? body : JSON.stringify(body),
  });
}

export function apiPatch(endpoint, body) {
  return apiFetch(endpoint, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function apiDelete(endpoint) {
  return apiFetch(endpoint, { method: "DELETE" });
}

export { getAccessToken, getRefreshToken, setTokens, clearTokens, API_URL };
