import { z } from 'zod';

export const ACADEMIC_FORM_FIELDS = ['type', 'title', 'institution', 'graduationDate', 'credentialCode', 'notes'] as const;

export type AcademicFormField = (typeof ACADEMIC_FORM_FIELDS)[number];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const CREDENTIAL_PATTERN = /^[A-Za-z0-9._/-]+$/;

export const academicSchema = z.object({
  type: z.enum(['DEGREE', 'CERTIFICATION', 'COURSE', 'OTHER'], { message: 'Selecciona el tipo de estudio' }),
  title: z.string().trim().min(1, 'Ingresa el título o nombre del estudio').min(3, 'El título debe tener al menos 3 caracteres'),
  institution: z.string().trim().min(1, 'Ingresa la institución').min(3, 'La institución debe tener al menos 3 caracteres'),
  graduationDate: z
    .string()
    .refine((value) => value === '' || DATE_PATTERN.test(value), 'Selecciona una fecha válida'),
  credentialCode: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || CREDENTIAL_PATTERN.test(value),
      'Usa solo letras, números, punto, guion, guion bajo o diagonal, sin espacios',
    ),
  notes: z.string().trim(),
});

export type AcademicFormValues = z.infer<typeof academicSchema>;

export function localToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function buildAcademicSchema(originalGraduationDate = '', today: string = localToday()) {
  return academicSchema.superRefine((values, ctx) => {
    const date = values.graduationDate;
    if (DATE_PATTERN.test(date) && date !== originalGraduationDate && date > today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['graduationDate'],
        message: 'La fecha de graduación no puede ser posterior a hoy.',
      });
    }
  });
}
