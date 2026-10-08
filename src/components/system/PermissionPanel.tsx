import type { UseQueryResult } from '@tanstack/react-query';
import ErrorAlert from '../ErrorAlert';
import StatusPanel from '../StatusPanel';
import { ApiError } from '../../services/http';
import { describeError } from '../../services/errorMessages';
import type { AuthUser } from '../../types/auth';

interface PermissionPanelProps {
  title: string;
  endpoint: string;
  expectedAllowed: boolean;
  query: UseQueryResult<AuthUser>;
}

function PermissionPanel({ title, endpoint, expectedAllowed, query }: PermissionPanelProps) {
  const forbidden = query.error instanceof ApiError && query.error.status === 403 ? query.error : null;
  const allowed = query.isSuccess;
  const settled = allowed || forbidden !== null;
  const matches = settled ? allowed === expectedAllowed : null;

  return (
    <StatusPanel title={title} endpoint={endpoint}>
      {query.isPending && (
        <p role="status" className="text-slate-600">
          Verificando…
        </p>
      )}

      {query.isError && !forbidden && (
        <ErrorAlert error={describeError(query.error)} onRetry={() => void query.refetch()} />
      )}

      {allowed && query.data && (
        <p className="font-semibold text-green-800">
          ✓ Acceso permitido (200) como {query.data.role.name}
        </p>
      )}

      {forbidden && (
        <div className="space-y-1">
          <p className="font-semibold text-amber-800">⚠ Acceso denegado (403)</p>
          <p className="text-xs text-slate-600">
            Código: {forbidden.code}
            {forbidden.requestId && (
              <>
                {' · '}ID: <span className="break-all">{forbidden.requestId}</span>
              </>
            )}
          </p>
        </div>
      )}

      {matches !== null && (
        <p className="mt-2 text-xs text-slate-600">
          Esperado para tu rol: {expectedAllowed ? 'permitido' : 'denegado'}.{' '}
          {matches ? '✓ Coincide.' : '✗ No coincide: reporta esta diferencia.'}
        </p>
      )}
    </StatusPanel>
  );
}

export default PermissionPanel;