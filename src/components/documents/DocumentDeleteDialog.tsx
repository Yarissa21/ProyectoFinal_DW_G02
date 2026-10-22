import { useState } from 'react';
import Modal from '../Modal';
import ServerIssueAlert from '../employees/ServerIssueAlert';
import { useDeleteDocument } from '../../hooks/useDocuments';
import { describeError } from '../../services/errorMessages';
import type { EmployeeDocument } from '../../types/document';
import type { ServerIssue } from '../../utils/formErrors';

interface DocumentDeleteDialogProps {
  employeeId: string;
  document: EmployeeDocument;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

interface DeleteConfirmProps {
  document: EmployeeDocument;
  onConfirm: () => Promise<unknown>;
  onClose: () => void;
  onDeleted: () => void;
}

function DeleteConfirm({ document, onConfirm, onClose, onDeleted }: DeleteConfirmProps) {
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
        Vas a eliminar el documento <span className="font-semibold break-all">{document.originalName}</span> (
        {document.documentType.name}).
      </p>
      <p className="text-sm text-slate-700">
        El archivo se borra del servidor y no se puede recuperar. Si el tipo de documento es obligatorio, el expediente
        puede quedar incompleto.
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
          {pending ? 'Eliminando…' : 'Eliminar documento'}
        </button>
      </div>
    </div>
  );
}

function DocumentDeleteDialog({ employeeId, document, open, onClose, onDeleted }: DocumentDeleteDialogProps) {
  const mutation = useDeleteDocument(employeeId, document.id);

  return (
    <Modal open={open} title="Eliminar documento" onClose={onClose} locked={mutation.isPending}>
      <DeleteConfirm
        document={document}
        onConfirm={() => mutation.mutateAsync()}
        onClose={onClose}
        onDeleted={onDeleted}
      />
    </Modal>
  );
}

export default DocumentDeleteDialog;