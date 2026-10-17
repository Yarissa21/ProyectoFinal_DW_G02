import { z } from 'zod';

export const USER_FORM_FIELDS = ['email', 'firstName', 'lastName', 'password', 'roleCode'] as const;

export const userSchema = z.object({
  email: z.string().trim().min(1, 'Ingresa el correo electrónico').email('Ingresa un correo válido'),
  firstName: z.string().trim().min(1, 'Ingresa el nombre'),
  lastName: z.string().trim().min(1, 'Ingresa el apellido'),
  password: z
    .string()
    .min(1, 'Ingresa la contraseña inicial')
    .min(10, 'La contraseña debe tener al menos 10 caracteres'),
  roleCode: z.enum(['ADMIN', 'HR_MANAGER', 'EMPLOYEE']),
});

export type UserFormValues = z.infer<typeof userSchema>;