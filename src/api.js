// client/src/api.js
const TOKEN_KEY = "bulkmail_token";
const USER_KEY = "bulkmail_user";
// Set VITE_API_URL (e.g. https://your-backend.onrender.com) to use a deployed backend.
// If unset, "/api" is used and the Vite dev proxy forwards it to localhost:5000.
const API_BASE = `${(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "")}/api`;

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
};
export const setUser = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u));

async function request(path, options = {}) {
  const token = getToken();
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token) {
    clearToken();
    window.dispatchEvent(new Event("auth-expired"));
  }
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.data = data;
    throw err;
  }
  return data;
}

export const register = (name, email, password) =>
  request("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });

export const login = (email, password) =>
  request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const sendMail = (payload) =>
  request("/mail/send", { method: "POST", body: JSON.stringify(payload) });

export const fetchHistory = (page = 1, limit = 10) =>
  request(`/mail/history?page=${page}&limit=${limit}`);

export const deleteRecord = (id) => request(`/mail/${id}`, { method: "DELETE" });
