import { describe, expect, it } from 'vitest';
import { useAuthStore } from './authStore';
import { crearSesion } from '../test/datos';

describe('Estado de la sesión', () => {
  it('guarda al usuario y sus tokens al iniciar sesión', () => {
    const { user, tokens } = crearSesion();

    useAuthStore.getState().setSession(user, tokens);

    const estado = useAuthStore.getState();
    expect(estado.isAuthenticated).toBe(true);
    expect(estado.user).toEqual(user);
    expect(estado.accessToken).toBe('token-de-acceso-falso');
    expect(estado.refreshToken).toBe('token-de-renovacion-falso');
  });

  it('borra todo al cerrar sesión', () => {
    const { user, tokens } = crearSesion();
    useAuthStore.getState().setSession(user, tokens);

    useAuthStore.getState().clearSession();

    const estado = useAuthStore.getState();
    expect(estado.isAuthenticated).toBe(false);
    expect(estado.user).toBeNull();
    expect(estado.accessToken).toBeNull();
    expect(estado.refreshToken).toBeNull();
    expect(sessionStorage.getItem('rh.refreshToken')).toBeNull();
  });
});