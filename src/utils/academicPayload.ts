import type { AcademicFormValues } from '../schemas/academicSchema';
import type {
  AcademicRecord,
  CreateAcademicRecordPayload,
  UpdateAcademicRecordPayload,
} from '../types/academic';
import { toDateInput } from './format';

export const EMPTY_ACADEMIC_VALUES: AcademicFormValues = {
  type: 'DEGREE',
  title: '',
  institution: '',
  graduationDate: '',
  credentialCode: '',
  notes: '',
};

export function academicToFormValues(record: AcademicRecord): AcademicFormValues {
  return {
    type: record.type,
    title: record.title,
    institution: record.institution,
    graduationDate: toDateInput(record.graduationDate),
    credentialCode: record.credentialCode ?? '',
    notes: record.notes ?? '',
  };
}

export function toCreateAcademicPayload(values: AcademicFormValues): CreateAcademicRecordPayload {
  const payload: CreateAcademicRecordPayload = {
    type: values.type,
    title: values.title,
    institution: values.institution,
  };
  if (values.graduationDate) payload.graduationDate = values.graduationDate;
  if (values.credentialCode) payload.credentialCode = values.credentialCode;
  if (values.notes) payload.notes = values.notes;
  return payload;
}

const FIELDS = ['type', 'title', 'institution', 'graduationDate', 'credentialCode', 'notes'] as const;

export function toUpdateAcademicPayload(
  values: AcademicFormValues,
  record: AcademicRecord,
): UpdateAcademicRecordPayload {
  const original = academicToFormValues(record);
  const changes: Record<string, string> = {};
  for (const key of FIELDS) {
    if (values[key] !== original[key]) changes[key] = values[key];
  }
  return changes as UpdateAcademicRecordPayload;
}
