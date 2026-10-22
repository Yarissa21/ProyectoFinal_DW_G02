import { z } from 'zod';
import { codeField } from './codeField';

export const DOCUMENT_TYPE_FORM_FIELDS = ['code', 'name', 'description', 'isRequired'] as const;

export const documentTypeSchema = z.object({
  code: codeField,
  name: z.string().trim().min(1, 'Ingresa el nombre'),
  description: z.string().trim(),
  isRequired: z.boolean(),
});
export type DocumentTypeFormValues = z.infer<typeof documentTypeSchema>;