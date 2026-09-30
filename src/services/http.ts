import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_URL } from './env';
import { useAuthStore } from '../store/authStore';
import type { ApiErrorBody, ApiSuccess } from '../types/api';
import type { AuthSession } from '../types/auth';

interface ApiErrorInit {
  status: number;
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  requestId?: string;

  constructor(init: ApiErrorInit) {
    super(init.message);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.details = init.details;
    this.requestId = init.requestId;
  }
}

function toApiError(error: AxiosError<ApiErrorBody>): ApiError {
  const response = error.response;

  if (!response) {
    return new ApiError({
      status: 0,
      code: error.code === 'ECONNABORTED' ? 'TIMEOUT' : 'NETWORK_ERROR',
      message: 'No fue posible comunicarse con el servidor',
    });
  }

  const body = response.data;
  const headerRequestId = response.headers?.['x-request-id'];

  return new ApiError({
    status: response.status,
    code: body?.error?.code ?? 'UNKNOWN_ERROR',
    message: body?.error?.message ?? 'Ocurrió un error inesperado',
    details: body?.error?.details,
    requestId: body?.requestId ?? (typeof headerRequestId === 'string' ? headerRequestId : undefined),
  });
}

function isAuthEndpoint(url: string | undefined): boolean {
  return !!url && (url.startsWith('/auth/login') || url.startsWith('/auth/refresh'));
}

export const http = axios.create({ baseURL: API_URL, timeout: 15000 });

const refreshClient = axios.create({ baseURL: API_URL, timeout: 15000 });

let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  const current = useAuthStore.getState().refreshToken;

  if (!current) {
    return Promise.reject(
      new ApiError({ status: 401, code: 'NO_REFRESH_TOKEN', message: 'No hay una sesión para renovar' })
    );
  }

  refreshPromise = refreshClient
    .post<ApiSuccess<AuthSession>>('/auth/refresh', { refreshToken: current })
    .then((res) => {
      const { user, tokens } = res.data.data;
      useAuthStore.getState().setSession(user, tokens);
      return tokens.accessToken;
    })
    .catch((error: AxiosError<ApiErrorBody>) => {
      useAuthStore.getState().clearSession();
      throw toApiError(error);
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && !isAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as RetriableConfig | undefined;

    if (error.response?.status === 401 && original && !original._retry && !isAuthEndpoint(original.url)) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return await http(original);
      } catch (refreshError) {
        return Promise.reject(refreshError instanceof ApiError ? refreshError : toApiError(error));
      }
    }

    return Promise.reject(toApiError(error));
  }
);