import { z } from 'zod';
import type { EmployeeCatalogs } from '../types/catalog';

export const EMPLOYEE_FORM_FIELDS = [
  'dpi',
  'firstName',
  'middleName',
  'lastName',
  'secondLastName',
  'birthDate',
  'address',
  'phone',
  'email',
  'baseSalary',
  'hireDate',
  'departmentId',
  'positionId',
] as const;

export type EmployeeFormField = (typeof EMPLOYEE_FORM_FIELDS)[number];

export const MIN_AGE = 18;
export const MAX_AGE = 100;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SALARY_PATTERN = /^\d+(\.\d{1,2})?$/;

const requiredText = (message: string) => z.string().trim().min(1, message);

export const employeeSchema = z.object({
  dpi: requiredText('Ingresa el DPI'),
  firstName: requiredText('Ingresa el primer nombre'),
  middleName: z.string().trim(),
  lastName: requiredText('Ingresa el primer apellido'),
  secondLastName: z.string().trim(),
  birthDate: z.string().regex(DATE_PATTERN, 'Selecciona la fecha de nacimiento'),
  address: requiredText('Ingresa la dirección'),
  phone: z.string().trim(),
  email: z
    .string()
    .trim()
    .min(1, 'Ingresa el correo electrónico')
    .email('Ingresa un correo válido'),
  baseSalary: z
    .string()
    .trim()
    .min(1, 'Ingresa el salario base')
    .regex(SALARY_PATTERN, 'Ingresa un monto válido, por ejemplo 8500.00'),
  hireDate: z.string().regex(DATE_PATTERN, 'Selecciona la fecha de ingreso'),
  departmentId: requiredText('Selecciona un departamento'),
  positionId: requiredText('Selecciona un puesto'),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

function localToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function ageOn(birthDate: string, today: string): number {
  const [birthYear, birthMonth, birthDay] = birthDate.split('-').map(Number);
  const [year, month, day] = today.split('-').map(Number);
  let age = year - birthYear;
  if (month < birthMonth || (month === birthMonth && day < birthDay)) age -= 1;
  return age;
}

export function buildEmployeeSchema(
  catalogs: EmployeeCatalogs,
  initial?: EmployeeFormValues,
  today: string = localToday(),
) {
  return employeeSchema.superRefine((values, ctx) => {
    const assignmentChanged =
      !initial || values.departmentId !== initial.departmentId || values.positionId !== initial.positionId;

    if (values.departmentId && values.positionId && assignmentChanged) {
      const position = catalogs.positions.find((item) => item.id === values.positionId);
      if (!position || !position.departmentIds.includes(values.departmentId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['positionId'],
          message: 'Este puesto no está habilitado en el departamento elegido.',
        });
      }
    }

    if (DATE_PATTERN.test(values.hireDate) && values.hireDate !== initial?.hireDate && values.hireDate > today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['hireDate'],
        message: 'La fecha de ingreso no puede ser posterior a hoy.',
      });
    }

    if (DATE_PATTERN.test(values.birthDate) && values.birthDate !== initial?.birthDate) {
      const age = ageOn(values.birthDate, today);
      if (age < MIN_AGE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['birthDate'],
          message: `La persona debe ser mayor de edad (${MIN_AGE} años o más).`,
        });
      } else if (age > MAX_AGE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['birthDate'],
          message: `La edad no puede ser mayor de ${MAX_AGE} años.`,
        });
      }
    }
  });
}