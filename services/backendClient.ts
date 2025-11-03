interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

const isConfigured = Boolean(API_URL);
let authToken: string | null = null;

const jsonHeaders = {
  'Content-Type': 'application/json',
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_URL) {
    throw new Error('Backend API URL is not configured');
  }

  const { method = 'GET', body, headers } = options;

  const headersRecord: Record<string, string> = { ...jsonHeaders };

  if (authToken) {
    headersRecord.Authorization = `Bearer ${authToken}`;
  }

  if (headers) {
    Object.assign(headersRecord, headers);
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: headersRecord,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const backendClient = {
  isConfigured,
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body }),
};

export const setBackendAuthToken = (token: string | null) => {
  authToken = token;
};
