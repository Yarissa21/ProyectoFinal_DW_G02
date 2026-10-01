import type { EmploymentStatus, RecordStatus } from '../types/employee';
import { EMPLOYMENT_STATUS_LABELS, RECORD_STATUS_LABELS } from '../utils/employeeLabels';

const baseClass = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap';

const EMPLOYMENT_CLASSES: Record<EmploymentStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-900',
  SUSPENDED: 'bg-amber-100 text-amber-900',
  RETIRED: 'bg-slate-200 text-slate-800',
};

const RECORD_CLASSES: Record<RecordStatus, string> = {
  COMPLETE: 'bg-green-100 text-green-900',
  IN_PROGRESS: 'bg-blue-100 text-blue-900',
  INCOMPLETE: 'bg-red-100 text-red-900',
};

export function EmploymentStatusBadge({ status }: { status: EmploymentStatus }) {
  return <span className={`${baseClass} ${EMPLOYMENT_CLASSES[status]}`}>{EMPLOYMENT_STATUS_LABELS[status]}</span>;
}

export function RecordStatusBadge({ status }: { status: RecordStatus }) {
  return <span className={`${baseClass} ${RECORD_CLASSES[status]}`}>{RECORD_STATUS_LABELS[status]}</span>;
}