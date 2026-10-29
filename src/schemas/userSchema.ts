import { z } from 'zod';
import { NAME_FORMAT_MESSAGE, NAME_MIN_LENGTH, NAME_MIN_MESSAGE, NAME_PATTERN } from './employeeSchema';

const personName = (required: string) =>
  z.string().trim().min(1, required).min(NAME_MIN_LENGTH, NAME_MIN_MESSAGE).regex(NAME_PATTERN, NAME_FORMAT_MESSAGE);

export const USER_FORM_FIELDS = ['email', 'firstName', 'lastName', 'password', 'roleCode'] as const;

export const userSchema = z.object({
  email: z.string().trim().min(1, 'Ingresa el correo electrónico').email('Ingresa un correo válido'),
  firstName: personName('Ingresa el nombre'),
  lastName: personName('Ingresa el apellido'),
    password: z
    .string()
    .min(1, 'Ingresa la contraseña inicial')
    .min(10, 'La contraseña debe tener al menos 10 caracteres')
    .regex(/[a-z]/, 'La contraseña debe incluir al menos una minúscula')
    .regex(/[A-Z]/, 'La contraseña debe incluir al menos una mayúscula')
    .regex(/\d/, 'La contraseña debe incluir al menos un número'),
  roleCode: z.enum(['ADMIN', 'HR_MANAGER', 'EMPLOYEE']),
});

export type UserFormValues = z.infer<typeof userSchema>;

export const USER_EDIT_FIELDS = ['email', 'firstName', 'lastName', 'roleCode'] as const;

export const userEditSchema = userSchema.omit({ password: true });
export type UserEditFormValues = z.infer<typeof userEditSchema>;