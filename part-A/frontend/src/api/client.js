const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const buildHeaders = (token, extra) => {
  const headers = {
    ...(extra || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

const parseError = async (response) => {
  try {
    const data = await response.json();
    if (data && data.message) {
      return data.message;
    }
  } catch {
    return response.statusText || 'Request failed';
  }
  return response.statusText || 'Request failed';
};

export const jsonRequest = async (path, options = {}) => {
  const { method = 'GET', token, body, headers } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(token, headers),
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export { API_BASE_URL };
