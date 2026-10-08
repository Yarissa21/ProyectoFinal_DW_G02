import type { AcademicRecordType } from '../types/academic';

export const ACADEMIC_TYPE_LABELS: Record<AcademicRecordType, string> = {
  DEGREE: 'Título',
  CERTIFICATION: 'Certificación',
  COURSE: 'Curso',
  OTHER: 'Otro',
};

export const ACADEMIC_TYPE_VALUES = Object.keys(ACADEMIC_TYPE_LABELS) as AcademicRecordType[];
