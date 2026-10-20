import { z } from 'zod';

export const BRANCH_FORM_FIELDS = ['code', 'name', 'address', 'phone', 'email', 'isHeadquarters'] as const;
export const DEPARTMENT_FORM_FIELDS = ['code', 'name', 'branchId', 'description'] as const;
export const POSITION_FORM_FIELDS = ['code', 'name', 'departmentIds', 'description'] as const;

export const branchSchema = z.object({
  code: z.string().trim().min(1, 'Ingresa el código'),
  name: z.string().trim().min(1, 'Ingresa el nombre'),
  address: z.string().trim().min(1, 'Ingresa la dirección'),
  phone: z.string().trim(),
  email: z
    .string()
    .trim()
    .refine((value) => value === '' || z.string().email().safeParse(value).success, 'Ingresa un correo válido'),
  isHeadquarters: z.boolean(),
});
export type BranchFormValues = z.infer<typeof branchSchema>;

export const departmentSchema = z.object({
  code: z.string().trim().min(1, 'Ingresa el código'),
  name: z.string().trim().min(1, 'Ingresa el nombre'),
  branchId: z.string().min(1, 'Selecciona la sede'),
  description: z.string().trim(),
});
export type DepartmentFormValues = z.infer<typeof departmentSchema>;

export const positionSchema = z.object({
  code: z.string().trim().min(1, 'Ingresa el código'),
  name: z.string().trim().min(1, 'Ingresa el nombre'),
  departmentIds: z.array(z.string()).min(1, 'Selecciona al menos un departamento'),
  description: z.string().trim(),
});
export type PositionFormValues = z.infer<typeof positionSchema>;