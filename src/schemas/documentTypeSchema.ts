import { z } from 'zod';

export const DOCUMENT_TYPE_FORM_FIELDS = ['code', 'name', 'description', 'isRequired'] as const;

export const documentTypeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Ingresa el código')
    .regex(/^[A-Za-z0-9_]+$/, 'Usa solo letras, números y guion bajo, sin espacios'),
  name: z.string().trim().min(1, 'Ingresa el nombre'),
  description: z.string().trim(),
  isRequired: z.boolean(),
});
export type DocumentTypeFormValues = z.infer<typeof documentTypeSchema>;