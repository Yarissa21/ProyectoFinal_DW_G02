import type {
  EmployeeSortField,
  EmploymentHistoryEventType,
  EmploymentStatus,
  RecordStatus,
} from '../types/employee';

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  ACTIVE: 'Activo',
  SUSPENDED: 'Suspendido',
  RETIRED: 'Retirado',
};

export const RECORD_STATUS_LABELS: Record<RecordStatus, string> = {
  COMPLETE: 'Completo',
  IN_PROGRESS: 'En proceso',
  INCOMPLETE: 'Incompleto',
};

export const HISTORY_EVENT_LABELS: Record<EmploymentHistoryEventType, string> = {
  BASELINE: 'Registro inicial',
  HIRED: 'Contratación',
  EMPLOYMENT_UPDATED: 'Datos laborales actualizados',
  STATUS_CHANGED: 'Cambio de estado',
  DELETED: 'Baja',
};

export const SORT_FIELD_LABELS: Record<EmployeeSortField, string> = {
  lastName: 'Apellido',
  hireDate: 'Fecha de ingreso',
};

export const EMPLOYMENT_STATUS_VALUES = Object.keys(EMPLOYMENT_STATUS_LABELS) as EmploymentStatus[];
export const RECORD_STATUS_VALUES = Object.keys(RECORD_STATUS_LABELS) as RecordStatus[];
export const SORT_FIELD_VALUES = Object.keys(SORT_FIELD_LABELS) as EmployeeSortField[];

export const PAGE_SIZES = [10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;