import EmptyState from '../EmptyState';
import type { ErrorDescription } from '../../services/errorMessages';

export const NOT_LINKED_CODE = 'EMPLOYEE_PROFILE_NOT_LINKED';

interface NotLinkedNoticeProps {
  error: ErrorDescription;
  onRetry: () => void;
  fetching?: boolean;
}

function NotLinkedNotice({ error, onRetry, fetching = false }: NotLinkedNoticeProps) {
  return (
    <div role="status">
      <EmptyState
        title="Tu cuenta todavía no está vinculada a un perfil de empleado"
        description="El área de Recursos Humanos debe asociar tu cuenta con tu registro de empleado. Cuando lo hagan, aquí verás tu información."
        action={
          <div className="space-y-3">
            <button
              type="button"
              onClick={onRetry}
              disabled={fetching}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
            >
              {fetching ? 'Comprobando…' : 'Comprobar de nuevo'}
            </button>
            {error.requestId && (
              <p className="text-xs text-slate-500">
                Si necesitas ayuda, comparte este código de referencia:{' '}
                <span className="break-all font-mono">{error.requestId}</span>
              </p>
            )}
          </div>
        }
      />
    </div>
  );
}

export default NotLinkedNotice;
