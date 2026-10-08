import type { UseQueryResult } from '@tanstack/react-query';
import ErrorAlert from '../ErrorAlert';
import StatusPanel from '../StatusPanel';
import { describeError } from '../../services/errorMessages';
import { formatDateTime } from '../../utils/format';
import type { HealthResponse, LivenessResponse } from '../../types/health';

interface HealthPanelProps {
  title: string;
  endpoint: string;
  query: UseQueryResult<HealthResponse | LivenessResponse>;
}

function hasDependencies(data: HealthResponse | LivenessResponse): data is HealthResponse {
  return 'dependencies' in data;
}

function HealthPanel({ title, endpoint, query }: HealthPanelProps) {
  const { data } = query;

  return (
    <StatusPanel title={title} endpoint={endpoint}>
      {query.isPending && (
        <p role="status" className="text-slate-600">
          Consultando…
        </p>
      )}

      {query.isError && (
        <ErrorAlert error={describeError(query.error)} onRetry={() => void query.refetch()} />
      )}

      {data && (
        <dl className="space-y-1">
          <div className="flex gap-1">
            <dt className="font-medium">Estado:</dt>
            <dd className={data.status === 'ok' ? 'font-semibold text-green-800' : 'font-semibold text-amber-800'}>
              {data.status === 'ok' ? '✓ Operativo' : '⚠ Degradado'}
            </dd>
          </div>
          {hasDependencies(data) && (
            <div className="flex gap-1">
              <dt className="font-medium">Base de datos:</dt>
              <dd>{data.dependencies.database === 'up' ? 'Disponible' : 'No disponible'}</dd>
            </div>
          )}
          <div className="flex gap-1">
            <dt className="font-medium">Servicio:</dt>
            <dd className="break-all">{data.instance.serviceName}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="font-medium">Instancia:</dt>
            <dd>{data.instance.groupId}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="font-medium">Revisión:</dt>
            <dd className="break-all">{data.instance.revision}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="font-medium">Consultado:</dt>
            <dd>{formatDateTime(data.timestamp)}</dd>
          </div>
        </dl>
      )}
    </StatusPanel>
  );
}

export default HealthPanel;