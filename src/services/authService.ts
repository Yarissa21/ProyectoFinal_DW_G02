import { http, refreshAccessToken } from './http';
import { useAuthStore } from '../store/authStore';
import type { ApiSuccess } from '../types/api';
import type { AuthSession, AuthUser, LoginPayload } from '../types/auth';

export async function login(payload: LoginPayload): Promise<AuthUser> {
  const res = await http.post<ApiSuccess<AuthSession>>('/auth/login', payload);
  const { user, tokens } = res.data.data;
  useAuthStore.getState().setSession(user, tokens);
  return user;
}

export async function logout(): Promise<void> {
  const refreshToken = useAuthStore.getState().refreshToken;
  try {
    if (refreshToken) {
      await http.post('/auth/logout', { refreshToken }).catch(() => undefined);
    }
  } finally {
    useAuthStore.getState().clearSession();
  }
}

export async function restoreSession(): Promise<void> {
  if (useAuthStore.getState().refreshToken) {
    await refreshAccessToken().catch(() => undefined);
  }
  useAuthStore.getState().finishInitializing();
}

export async function fetchMe(): Promise<AuthUser> {
  const res = await http.get<ApiSuccess<AuthUser>>('/auth/me');
  return res.data.data;
}