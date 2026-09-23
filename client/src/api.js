const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

let unauthorizedHandler = null;

/** Registra la acción a ejecutar cuando la API responde 401 con un token (sesión expirada). */
export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && token && unauthorizedHandler) unauthorizedHandler();
    throw new Error(data?.error?.message || `Error ${res.status}`);
  }
  return data;
}

export const api = {
  register: (email, password) => request('/auth/register', { method: 'POST', body: { email, password } }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),

  listProducts: () => request('/products'),
  createProduct: (token, product) => request('/products', { method: 'POST', body: product, token }),
  updateProduct: (token, id, product) => request(`/products/${id}`, { method: 'PUT', body: product, token }),
  deleteProduct: (token, id) => request(`/products/${id}`, { method: 'DELETE', token }),

  listOrders: (token) => request('/orders', { token }),
  createOrder: (token, items) => request('/orders', { method: 'POST', body: { items }, token }),
};
