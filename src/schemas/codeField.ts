import { z } from 'zod';

export const codeField = z
  .string()
  .trim()
  .min(1, 'Ingresa el código')
  .regex(/^[A-Za-z0-9_-]+$/, 'Usa solo letras, números, guion o guion bajo, sin espacios')
  .transform((value) => value.toUpperCase());