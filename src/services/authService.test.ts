import { beforeEach, describe, expect, it, vi } from 'vitest';
import { login, logout, restoreSession } from './authService';
import { http, refreshAccessToken } from './http';
import { useAuthStore } from '../store/authStore';
import { administradora, crearSesion } from '../test/datos';

vi.mock('./http', () => ({
  http: { post: vi.fn(), get: vi.fn() },
  refreshAccessToken: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('Login', () => {
  it('envía las credenciales y guarda la sesión', async () => {
    vi.mocked(http.post).mockResolvedValue({ data: { data: crearSesion() } });

    const usuario = await login({ email: 'ana@ejemplo.test', password: 'Clave12345' });

    expect(http.post).toHaveBeenCalledWith('/auth/login', { email: 'ana@ejemplo.test', password: 'Clave12345' });
    expect(usuario).toEqual(administradora);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});

describe('Cierre de sesión', () => {
  it('avisa al servidor y limpia la sesión', async () => {
    const { user, tokens } = crearSesion();
    useAuthStore.getState().setSession(user, tokens);
    vi.mocked(http.post).mockResolvedValue({ data: {} });

    await logout();

    expect(http.post).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'token-de-renovacion-falso' });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

describe('Renovación de la sesión al abrir la aplicación', () => {
  it('termina de cargar aunque la renovación falle', async () => {
    useAuthStore.setState({ refreshToken: 'token-vencido', isInitializing: true });
    vi.mocked(refreshAccessToken).mockRejectedValue(new Error('Token vencido'));

    await restoreSession();

    expect(useAuthStore.getState().isInitializing).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});