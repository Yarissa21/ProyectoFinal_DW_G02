import type { EmploymentStatus, RecordStatus } from '../types/employee';
import { EMPLOYMENT_STATUS_LABELS, RECORD_STATUS_LABELS } from '../utils/employeeLabels';

const baseClass =
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap';

const EMPLOYMENT_CLASSES: Record<EmploymentStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-900',
  SUSPENDED: 'bg-amber-100 text-amber-900',
  RETIRED: 'bg-slate-200 text-slate-800',
};

const RECORD_CLASSES: Record<RecordStatus, string> = {
  COMPLETE: 'bg-emerald-100 text-emerald-900',
  IN_PROGRESS: 'bg-sky-100 text-sky-900',
  INCOMPLETE: 'bg-rose-100 text-rose-900',
};

function Dot() {
  return <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />;
}

export function EmploymentStatusBadge({ status }: { status: EmploymentStatus }) {
  return (
    <span className={`${baseClass} ${EMPLOYMENT_CLASSES[status]}`}>
      <Dot />
      {EMPLOYMENT_STATUS_LABELS[status]}
    </span>
  );
}

export function RecordStatusBadge({ status }: { status: RecordStatus }) {
  return (
    <span className={`${baseClass} ${RECORD_CLASSES[status]}`}>
      <Dot />
      {RECORD_STATUS_LABELS[status]}
    </span>
  );
}