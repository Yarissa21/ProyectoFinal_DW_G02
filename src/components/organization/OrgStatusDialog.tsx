import { useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import Modal from '../Modal';
import ServerIssueAlert from '../employees/ServerIssueAlert';
import { describeError } from '../../services/errorMessages';
import type { UpdateOrgStatusPayload } from '../../types/organization';
import type { ServerIssue } from '../../utils/formErrors';

interface OrgItem {
  id: string;
  name: string;
  isActive: boolean;
}

interface OrgStatusDialogProps {
  item: OrgItem;
  singular: string;
  feminine?: boolean;
  deactivateWarning: string;
  useStatus: (id: string) => UseMutationResult<unknown, Error, UpdateOrgStatusPayload>;
  onClose: () => void;
  onSaved: () => void;
}

function OrgStatusDialog({
  item,
  singular,
  feminine = false,
  deactivateWarning,
  useStatus,
  onClose,
  onSaved,
}: OrgStatusDialogProps) {
  const mutation = useStatus(item.id);
  const [issue, setIssue] = useState<ServerIssue | null>(null);
  const activate = !item.isActive;
  const verb = activate ? 'Activar' : 'Desactivar';

  const confirm = async () => {
    setIssue(null);
    try {
      await mutation.mutateAsync({ isActive: activate });
      onSaved();
    } catch (error) {
      setIssue({ error: describeError(error), extra: [] });
    }
  };

  return (
    <Modal open title={`${verb} ${singular}`} onClose={onClose} locked={mutation.isPending}>
      <div className="space-y-4">
        <p className="text-sm text-slate-700">
          Vas a {verb.toLowerCase()} {feminine ? 'la' : 'el'} {singular}{' '}
          <span className="font-semibold">{item.name}</span>.
        </p>
        <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Antes de confirmar</p>
          <p className="mt-1">
            {activate
              ? `${feminine ? 'La' : 'El'} ${singular} volverá a estar disponible para asignarse a empleados.`
              : deactivateWarning}
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
            {mutation.isPending ? 'Procesando…' : verb}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default OrgStatusDialog;