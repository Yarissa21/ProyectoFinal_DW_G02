import { z } from 'zod';

export const CONTACT_FORM_FIELDS = ['address', 'phone'] as const;

export type ContactFormField = (typeof CONTACT_FORM_FIELDS)[number];

// Límites tomados del contrato OpenAPI (UpdateSelfServiceContactDto).
export const ADDRESS_MAX_LENGTH = 300;
export const PHONE_MAX_LENGTH = 30;

// El perfil siempre devuelve la dirección (campo obligatorio), por eso no se permite dejarla vacía.
export const contactSchema = z.object({
  address: z
    .string()
    .trim()
    .min(1, 'Ingresa tu dirección')
    .max(ADDRESS_MAX_LENGTH, `La dirección no puede superar ${ADDRESS_MAX_LENGTH} caracteres`),
  phone: z.string().trim().max(PHONE_MAX_LENGTH, `El teléfono no puede superar ${PHONE_MAX_LENGTH} caracteres`),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
