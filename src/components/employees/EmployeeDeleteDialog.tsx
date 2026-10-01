import { useState } from 'react';
import Modal from '../Modal';
import ServerIssueAlert from './ServerIssueAlert';
import { useDeleteEmployee } from '../../hooks/useEmployees';
import { describeError } from '../../services/errorMessages';
import type { Employee } from '../../types/employee';
import { fullName } from '../../utils/format';
import type { ServerIssue } from '../../utils/formErrors';

interface EmployeeDeleteDialogProps {
  employee: Employee;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

interface DeleteConfirmProps {
  employee: Employee;
  onConfirm: () => Promise<unknown>;
  onClose: () => void;
  onDeleted: () => void;
}

function DeleteConfirm({ employee, onConfirm, onClose, onDeleted }: DeleteConfirmProps) {
  const [issue, setIssue] = useState<ServerIssue | null>(null);
  const [pending, setPending] = useState(false);

  const confirm = async () => {
    setIssue(null);
    setPending(true);
    try {
      await onConfirm();
      onDeleted();
    } catch (error) {
      setIssue({ error: describeError(error), extra: [] });
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700">
        Vas a dar de baja a <span className="font-semibold">{fullName(employee)}</span>.
      </p>
      <p className="text-sm text-slate-700">
        El empleado quedará retirado y se conservará su historial laboral.
        {employee.user && ` Se desactivará su usuario vinculado (${employee.user.email}).`}
      </p>

      {issue && <ServerIssueAlert issue={issue} onRetry={() => void confirm()} />}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => void confirm()}
          disabled={pending}
          aria-busy={pending}
          className="rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:opacity-60"
        >
          {pending ? 'Procesando…' : 'Dar de baja'}
        </button>
      </div>
    </div>
  );
}

function EmployeeDeleteDialog({ employee, open, onClose, onDeleted }: EmployeeDeleteDialogProps) {
  const mutation = useDeleteEmployee(employee.id);

  return (
    <Modal open={open} title="Dar de baja al empleado" onClose={onClose} locked={mutation.isPending}>
      <DeleteConfirm
        employee={employee}
        onConfirm={() => mutation.mutateAsync()}
        onClose={onClose}
        onDeleted={onDeleted}
      />
    </Modal>
  );
}

export default EmployeeDeleteDialog;