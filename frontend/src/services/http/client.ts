import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from './errors';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request interceptor: add active tenant header if present in session
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tenantId = sessionStorage.getItem('churchmanager_active_tenant_id');
    if (tenantId && !config.headers.has('X-Tenant-Id')) {
      config.headers.set('X-Tenant-Id', tenantId);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized / expired session
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('churchmanager:unauthorized'));
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Erro na comunicação com a API.';
    const statusCode = error.response?.status || 500;
    const errors = error.response?.data?.errors;

    return Promise.reject(new ApiError(message, statusCode, errors));
  }
);

/**
 * Helper to fetch Sanctum CSRF cookie before authentication requests
 */
export async function initializeCsrfProtection(): Promise<void> {
  if (import.meta.env.VITE_USE_DEV_MOCK === 'true') {
    return;
  }
  try {
    await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
  } catch (err) {
    console.warn('[ChurchManager] Não foi possível inicializar CSRF cookie:', err);
  }
}

/**
 * Typed HTTP request wrappers
 */
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    httpClient.get<T>(url, config).then((res) => res.data),

  post: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) =>
    httpClient.post<T>(url, data, config).then((res) => res.data),

  put: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) =>
    httpClient.put<T>(url, data, config).then((res) => res.data),

  patch: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) =>
    httpClient.patch<T>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    httpClient.delete<T>(url, config).then((res) => res.data),
};
