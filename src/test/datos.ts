import type { AuthSession, AuthUser } from '../types/auth';

export const URL_API = 'http://api.test/api/v1';

export const administradora: AuthUser = {
  id: 'usuario-1',
  email: 'ana@ejemplo.test',
  firstName: 'Ana',
  lastName: 'Prueba',
  isActive: true,
  role: { code: 'ADMIN', name: 'Administrador' },
};

export const empleado: AuthUser = {
  id: 'usuario-2',
  email: 'luis@ejemplo.test',
  firstName: 'Luis',
  lastName: 'Ejemplo',
  isActive: true,
  role: { code: 'EMPLOYEE', name: 'Empleado' },
};

export const gestoraRrhh: AuthUser = {
  id: 'usuario-3',
  email: 'sofia.ramirez@example.com',
  firstName: 'Sofía',
  lastName: 'Ramírez',
  isActive: true,
  role: { code: 'HR_MANAGER', name: 'Gestor de RRHH' },
};

export function crearSesion(usuario: AuthUser = administradora, sufijo = 'falso'): AuthSession {
  return {
    user: usuario,
    tokens: {
      accessToken: `token-de-acceso-${sufijo}`,
      refreshToken: `token-de-renovacion-${sufijo}`,
      tokenType: 'Bearer',
      expiresIn: 900,
      refreshExpiresIn: 604800,
    },
  };
}

export function respuestaExitosa<T>(data: T) {
  return { success: true, data, timestamp: '2026-10-22T12:00:00.000Z', path: '/', requestId: 'solicitud-de-prueba' };
}

export function respuestaDeError(code: string, message: string) {
  return {
    success: false,
    error: { code, message },
    timestamp: '2026-10-22T12:00:00.000Z',
    path: '/',
    requestId: 'solicitud-de-prueba',
  };
}