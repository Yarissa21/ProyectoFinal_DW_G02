import { z } from 'zod';
import { codeField } from './codeField';

export const DOCUMENT_TYPE_FORM_FIELDS = ['code', 'name', 'description', 'isRequired'] as const;

export const documentTypeSchema = z.object({
  code: codeField,
  name: z
    .string()
    .trim()
    .min(1, 'Ingresa el nombre')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .regex(/[\p{L}\d]/u, 'El nombre debe incluir letras o números'),
  description: z.string().trim(),
  isRequired: z.boolean(),
});
export type DocumentTypeFormValues = z.infer<typeof documentTypeSchema>;