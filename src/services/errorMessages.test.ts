import { describe, expect, it } from 'vitest';
import { describeError } from './errorMessages';
import { ApiError } from './http';

function crearError(status: number, code: string): ApiError {
  return new ApiError({ status, code, message: 'Mensaje en inglés', timestamp: '2026-10-22T12:00:00.000Z' });
}

describe('Mensajes de error ', () => {
  it('explica que el correo o la contraseña son incorrectos', () => {
    const descripcion = describeError(crearError(401, 'INVALID_CREDENTIALS'));

    expect(descripcion.message).toBe('El correo o la contraseña son incorrectos.');
  });

  it('explica que la sesión no es válida o venció', () => {
    const descripcion = describeError(crearError(401, 'UNAUTHORIZED'));

    expect(descripcion.message).toBe('Tu sesión no es válida o venció. Inicia sesión de nuevo.');
  });

  it('avisa que no hay conexión con el servidor', () => {
    const descripcion = describeError(crearError(0, 'NETWORK_ERROR'));

    expect(descripcion.message).toBe(
      'No fue posible comunicarse con el servidor. Revisa tu conexión e inténtalo de nuevo.',
    );
  });

  it('usa un mensaje general cuando el error no viene de la API', () => {
    expect(describeError(new Error('falla')).message).toBe('Ocurrió un error inesperado.');
  });
});