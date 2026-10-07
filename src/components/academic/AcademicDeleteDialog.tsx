import { useState } from 'react';
import Modal from '../Modal';
import ServerIssueAlert from '../employees/ServerIssueAlert';
import { useDeleteAcademicRecord } from '../../hooks/useAcademicRecords';
import { describeError } from '../../services/errorMessages';
import type { AcademicRecord } from '../../types/academic';
import { ACADEMIC_TYPE_LABELS } from '../../utils/academicLabels';
import type { ServerIssue } from '../../utils/formErrors';

interface AcademicDeleteDialogProps {
  employeeId: string;
  record: AcademicRecord;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

interface DeleteConfirmProps {
  record: AcademicRecord;
  onConfirm: () => Promise<unknown>;
  onClose: () => void;
  onDeleted: () => void;
}

function DeleteConfirm({ record, onConfirm, onClose, onDeleted }: DeleteConfirmProps) {
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
        Vas a eliminar el antecedente <span className="font-semibold">{record.title}</span> (
        {ACADEMIC_TYPE_LABELS[record.type]}, {record.institution}).
      </p>
      <p className="text-sm text-slate-700">Dejará de aparecer en el expediente académico del empleado.</p>

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
          {pending ? 'Eliminando…' : 'Eliminar antecedente'}
        </button>
      </div>
    </div>
  );
}

function AcademicDeleteDialog({ employeeId, record, open, onClose, onDeleted }: AcademicDeleteDialogProps) {
  const mutation = useDeleteAcademicRecord(employeeId, record.id);

  return (
    <Modal open={open} title="Eliminar antecedente académico" onClose={onClose} locked={mutation.isPending}>
      <DeleteConfirm
        record={record}
        onConfirm={() => mutation.mutateAsync()}
        onClose={onClose}
        onDeleted={onDeleted}
      />
    </Modal>
  );
}

export default AcademicDeleteDialog;
