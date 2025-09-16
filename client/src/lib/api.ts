const API_BASE_URL = "https://rental-app-ubtc.onrender.com/api/v1";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config);

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON, or empty
      errorData.message = response.statusText;
    }
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }

  // Handle cases where the response might be 204 No Content
  if (response.status === 204 || response.headers.get("Content-Length") === "0") {
    return {} as T; // Return an empty object for no content responses
  }

  return response.json();
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
};
