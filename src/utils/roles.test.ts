import { describe, expect, it } from 'vitest';
import { homePathForRole } from './roles';

describe('Pantalla de inicio según el rol', () => {
  it('lleva a la administración y a RRHH al dashboard', () => {
    expect(homePathForRole('ADMIN')).toBe('/dashboard');
    expect(homePathForRole('HR_MANAGER')).toBe('/dashboard');
  });

  it('lleva al empleado a su pantalla de inicio', () => {
    expect(homePathForRole('EMPLOYEE')).toBe('/inicio');
  });
});