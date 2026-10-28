import { z } from 'zod';
import { codeField } from './codeField';

export const BRANCH_FORM_FIELDS = ['code', 'name', 'address', 'phone', 'email', 'isHeadquarters'] as const;
export const DEPARTMENT_FORM_FIELDS = ['code', 'name', 'branchId', 'description'] as const;
export const POSITION_FORM_FIELDS = ['code', 'name', 'departmentIds', 'description'] as const;

const nameField = z
  .string()
  .trim()
  .min(1, 'Ingresa el nombre')
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .regex(/[\p{L}\d]/u, 'El nombre debe incluir letras o números');

export const branchSchema = z.object({
  code: codeField,
  name: nameField,
  address: z.string().trim().min(1, 'Ingresa la dirección').min(5, 'La dirección debe tener al menos 5 caracteres'),
  phone: z.string().trim(),
  email: z
    .string()
    .trim()
    .refine((value) => value === '' || z.string().email().safeParse(value).success, 'Ingresa un correo válido'),
  isHeadquarters: z.boolean(),
});
export type BranchFormValues = z.infer<typeof branchSchema>;

export const departmentSchema = z.object({
  code: codeField,
  name: nameField,
  branchId: z.string().min(1, 'Selecciona la sede'),
  description: z.string().trim(),
});
export type DepartmentFormValues = z.infer<typeof departmentSchema>;

export const positionSchema = z.object({
  code: codeField,
  name: nameField,
  departmentIds: z.array(z.string()).min(1, 'Selecciona al menos un departamento'),
  description: z.string().trim(),
});
export type PositionFormValues = z.infer<typeof positionSchema>;