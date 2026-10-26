import { describe, expect, it } from 'vitest';
import { loginSchema } from './loginSchema';

function mensajesDeError(email: string, password: string): string[] {
  const resultado = loginSchema.safeParse({ email, password });
  if (resultado.success) return [];
  return resultado.error.issues.map((problema) => problema.message);
}

describe('Esquema del formulario de login', () => {
  it('acepta un correo y una contraseña válidos', () => {
    const resultado = loginSchema.safeParse({ email: 'ana@ejemplo.test', password: 'Clave12345' });

    expect(resultado.success).toBe(true);
  });

  it('rechaza un correo sin formato válido', () => {
    expect(mensajesDeError('correoincorrectogmail.com', 'Clave12345')).toContain('Ingresa un correo válido');
  });

  it('exige al menos 8 caracteres en la contraseña', () => {
    expect(mensajesDeError('ana@ejemplo.test', 'abc123')).toContain('La contraseña debe tener al menos 8 caracteres');
  });
});