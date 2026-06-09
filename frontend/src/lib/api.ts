import axios from 'axios';
import { toast } from 'sonner';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export const api = axios.create({ baseURL, withCredentials: false });

// ── Token storage ────────────────────────────────────────────────────────
const ACCESS = 'fems_access';
const REFRESH = 'fems_refresh';
export const tokenStore = {
  get access() { return localStorage.getItem(ACCESS); },
  get refresh() { return localStorage.getItem(REFRESH); },
  set(access: string, refresh: string) { localStorage.setItem(ACCESS, access); localStorage.setItem(REFRESH, refresh); },
  clear() { localStorage.removeItem(ACCESS); localStorage.removeItem(REFRESH); },
};

// Attach the bearer token to every request.
api.interceptors.request.use((cfg) => {
  const t = tokenStore.access;
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// Transparent refresh on 401, then retry the original request once.
let refreshing: Promise<string> | null = null;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && !original._retry && tokenStore.refresh) {
      original._retry = true;
      try {
        refreshing ??= axios
          .post(`${baseURL}/auth/refresh`, { refreshToken: tokenStore.refresh })
          .then((r) => {
            const { accessToken, refreshToken } = r.data.data;
            tokenStore.set(accessToken, refreshToken);
            return accessToken as string;
          })
          .finally(() => { refreshing = null; });

        const newToken = await refreshing;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        tokenStore.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    const message = error.response?.data?.error?.message ?? 'Something went wrong';
    if (status !== 401) toast.error(message);
    return Promise.reject(error);
  },
);
