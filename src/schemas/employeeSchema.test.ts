import { describe, expect, it } from 'vitest';
import { buildEmployeeSchema, type EmployeeFormValues } from './employeeSchema';
import type { EmployeeCatalogs } from '../types/catalog';

const HOY = '2026-10-22';

const catalogos: EmployeeCatalogs = {
  departments: [
    { id: 'depto-ventas', code: 'VENTAS', name: 'Ventas' },
    { id: 'depto-contabilidad', code: 'CONTABILIDAD', name: 'Contabilidad' },
  ],
  positions: [
    { id: 'puesto-vendedor', code: 'VENDEDOR', name: 'Vendedor', departmentIds: ['depto-ventas'] },
    { id: 'puesto-contador', code: 'CONTADOR', name: 'Contador', departmentIds: ['depto-contabilidad'] },
  ],
};

const empleadoValido: EmployeeFormValues = {
  dpi: '2547839210101',
  firstName: 'María',
  middleName: 'Fernanda',
  lastName: 'López',
  secondLastName: 'Ruiz',
  birthDate: '1992-04-15',
  address: '5a avenida 10-25, zona 1, Chiquimula',
  phone: '5512-3478',
  email: 'maria.lopez@example.com',
  baseSalary: '8500.00',
  hireDate: '2024-02-01',
  departmentId: 'depto-ventas',
  positionId: 'puesto-vendedor',
};

function mensajes(cambios: Partial<EmployeeFormValues>): string[] {
  const esquema = buildEmployeeSchema(catalogos, undefined, HOY);
  const resultado = esquema.safeParse({ ...empleadoValido, ...cambios });
  return resultado.success ? [] : resultado.error.issues.map((problema) => problema.message);
}

describe('Formulario de empleado', () => {
  it('acepta los datos de una persona empleada válida', () => {
    expect(mensajes({})).toEqual([]);
  });

  it('pide los datos obligatorios cuando están vacíos', () => {
    const errores = mensajes({
      dpi: '',
      firstName: '',
      lastName: '',
      address: '',
      email: '',
      baseSalary: '',
    });

    expect(errores).toContain('Ingresa el DPI');
    expect(errores).toContain('Ingresa el primer nombre');
    expect(errores).toContain('Ingresa el primer apellido');
    expect(errores).toContain('Ingresa la dirección');
    expect(errores).toContain('Ingresa el correo electrónico');
    expect(errores).toContain('Ingresa el salario base');
  });

  it('rechaza a una persona menor de edad', () => {
    expect(mensajes({ birthDate: '2012-06-10' })).toContain('La persona debe ser mayor de edad (18 años o más).');
  });

  it('rechaza un puesto que no pertenece al departamento elegido', () => {
    expect(mensajes({ departmentId: 'depto-contabilidad', positionId: 'puesto-vendedor' })).toContain(
      'Este puesto no está habilitado en el departamento elegido.',
    );
  });
});