import { useState } from 'react';
import Modal from '../Modal';
import ServerIssueAlert from '../employees/ServerIssueAlert';
import { useUpdateDocumentTypeStatus } from '../../hooks/useDocuments';
import { describeError } from '../../services/errorMessages';
import type { DocumentType } from '../../types/document';
import type { ServerIssue } from '../../utils/formErrors';

interface DocumentTypeStatusDialogProps {
  documentType: DocumentType;
  onClose: () => void;
  onSaved: (message: string) => void;
}

function DocumentTypeStatusDialog({ documentType, onClose, onSaved }: DocumentTypeStatusDialogProps) {
  const mutation = useUpdateDocumentTypeStatus(documentType.id);
  const [issue, setIssue] = useState<ServerIssue | null>(null);
  const activate = !documentType.isActive;
  const verb = activate ? 'Activar' : 'Desactivar';

  const confirm = async () => {
    setIssue(null);
    try {
      await mutation.mutateAsync(activate);
      onSaved(activate ? 'Tipo de documento activado correctamente.' : 'Tipo de documento desactivado correctamente.');
    } catch (error) {
      setIssue({ error: describeError(error), extra: [] });
    }
  };

  return (
    <Modal open title={`${verb} tipo de documento`} onClose={onClose} locked={mutation.isPending}>
      <div className="space-y-4">
        <p className="text-sm text-slate-700">
          Vas a {verb.toLowerCase()} el tipo <span className="font-semibold">{documentType.name}</span>.
        </p>
        <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Antes de confirmar</p>
          <p className="mt-1">
            {activate
              ? 'El tipo volverá a estar disponible para subir documentos.'
              : 'Ya no se podrán subir documentos de este tipo. Los documentos que ya existen se conservan.'}
          </p>
        </div>

        {issue && <ServerIssueAlert issue={issue} onRetry={() => void confirm()} />}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={mutation.isPending}
            aria-busy={mutation.isPending}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
          >
            {mutation.isPending ? 'Guardando…' : verb}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default DocumentTypeStatusDialog;