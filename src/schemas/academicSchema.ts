import { z } from 'zod';

export const ACADEMIC_FORM_FIELDS = ['type', 'title', 'institution', 'graduationDate', 'credentialCode', 'notes'] as const;

export type AcademicFormField = (typeof ACADEMIC_FORM_FIELDS)[number];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// El contrato (OpenAPI) solo declara como obligatorios type, title e institution
// y no define longitudes máximas para los textos, por eso no se inventan aquí.
export const academicSchema = z.object({
  type: z.enum(['DEGREE', 'CERTIFICATION', 'COURSE', 'OTHER'], { message: 'Selecciona el tipo de estudio' }),
  title: z.string().trim().min(1, 'Ingresa el título o nombre del estudio'),
  institution: z.string().trim().min(1, 'Ingresa la institución'),
  graduationDate: z
    .string()
    .refine((value) => value === '' || DATE_PATTERN.test(value), 'Selecciona una fecha válida'),
  credentialCode: z.string().trim(),
  notes: z.string().trim(),
});

export type AcademicFormValues = z.infer<typeof academicSchema>;

/** Fecha de hoy (zona horaria local) en formato AAAA-MM-DD, igual que devuelve un <input type="date">. */
export function localToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * La fecha de graduación no puede ser posterior a hoy. Si el antecedente ya traía una fecha
 * (original) y no se modificó, se respeta para no bloquear la edición de otros campos.
 */
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
