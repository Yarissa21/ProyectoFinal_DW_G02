import { z } from 'zod';
import type { EmploymentStatus } from '../types/employee';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const STATUS_FORM_FIELDS = ['status', 'terminationDate'] as const;

export const employeeStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'RETIRED']),
  terminationDate: z.string().refine((value) => value === '' || DATE_PATTERN.test(value), 'Selecciona una fecha válida'),
});

export type EmployeeStatusFormValues = z.infer<typeof employeeStatusSchema>;

export function buildEmployeeStatusSchema(currentStatus: EmploymentStatus) {
  return employeeStatusSchema.superRefine((values, ctx) => {
    if (values.status === currentStatus) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['status'],
        message: 'Selecciona un estado distinto al actual.',
      });
    }
    if (values.status === 'RETIRED' && values.terminationDate === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['terminationDate'],
        message: 'Selecciona la fecha de baja.',
      });
    }
  });
}