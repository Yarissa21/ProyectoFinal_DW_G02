import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmploymentStatusBadge } from '../EmployeeBadges';
import Modal from '../Modal';
import FormField from './FormField';
import ServerIssueAlert from './ServerIssueAlert';
import { useUpdateEmployeeStatus } from '../../hooks/useEmployees';
import {
  buildEmployeeStatusSchema,
  STATUS_FORM_FIELDS,
  type EmployeeStatusFormValues,
} from '../../schemas/employeeStatusSchema';
import type { Employee, UpdateEmploymentStatusPayload } from '../../types/employee';
import { EMPLOYMENT_STATUS_LABELS, EMPLOYMENT_STATUS_VALUES } from '../../utils/employeeLabels';
import { fullName } from '../../utils/format';
import { resolveServerIssue, type ServerIssue } from '../../utils/formErrors';

interface EmployeeStatusDialogProps {
  employee: Employee;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface StatusFormProps {
  employee: Employee;
  onSubmit: (payload: UpdateEmploymentStatusPayload) => Promise<unknown>;
  onClose: () => void;
  onSaved: () => void;
}

function StatusForm({ employee, onSubmit, onClose, onSaved }: StatusFormProps) {
  const [issue, setIssue] = useState<ServerIssue | null>(null);
  const schema = useMemo(() => buildEmployeeStatusSchema(employee.status), [employee.status]);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeStatusFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: employee.status, terminationDate: '' },
    mode: 'onTouched',
  });

  const status = useWatch({ control, name: 'status' });

  const submit = handleSubmit(async (values) => {
    setIssue(null);
    const payload: UpdateEmploymentStatusPayload = { status: values.status };
    if (values.status === 'RETIRED' && values.terminationDate) payload.terminationDate = values.terminationDate;

    try {
      await onSubmit(payload);
      onSaved();
    } catch (error) {
      setIssue(
        resolveServerIssue(error, STATUS_FORM_FIELDS, (field, message, focus) =>
          setError(field, { type: 'server', message }, { shouldFocus: focus }),
        ),
      );
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <p className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
        <span className="font-medium">{fullName(employee)}</span>
        <span>está actualmente</span>
        <EmploymentStatusBadge status={employee.status} />
      </p>

      <FormField id="status-new" label="Nuevo estado" required error={errors.status?.message}>
        {(field) => (
          <select {...field} {...register('status')}>
            {EMPLOYMENT_STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {EMPLOYMENT_STATUS_LABELS[value]}
                {value === employee.status ? ' (actual)' : ''}
              </option>
            ))}
          </select>
        )}
      </FormField>

      {status === 'RETIRED' && (
        <FormField
          id="status-termination"
          label="Fecha de baja"
          hint="Opcional."
          error={errors.terminationDate?.message}
        >
          {(field) => <input type="date" {...field} {...register('terminationDate')} />}
        </FormField>
      )}

      {issue && <ServerIssueAlert issue={issue} onRetry={() => void submit()} />}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
        >
          {isSubmitting ? 'Guardando…' : 'Cambiar estado'}
        </button>
      </div>
    </form>
  );
}

function EmployeeStatusDialog({ employee, open, onClose, onSaved }: EmployeeStatusDialogProps) {
  const mutation = useUpdateEmployeeStatus(employee.id);

  return (
    <Modal open={open} title="Cambiar estado laboral" onClose={onClose} locked={mutation.isPending}>
      <StatusForm
        employee={employee}
        onSubmit={(payload) => mutation.mutateAsync(payload)}
        onClose={onClose}
        onSaved={onSaved}
      />
    </Modal>
  );
}

export default EmployeeStatusDialog;