import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import LoadingState from '../components/LoadingState';
import StatCard from '../components/StatCard';
import { useDashboard } from '../hooks/useDashboard';
import { describeError } from '../services/errorMessages';
import { formatCount } from '../utils/dashboardLabels';
import { formatDateTime } from '../utils/format';
import type { DashboardWorkforce } from '../types/dashboard';

const secondaryButtonClass =
  'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-60';
const primaryLinkClass =
  'inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

function WorkforceSection({ workforce }: { workforce: DashboardWorkforce }) {
  if (workforce.total === 0) {
    return (
      <EmptyState
        title="Todavía no hay empleados registrados."
        description="Los indicadores se llenarán cuando se registre el primer empleado."
        action={
          <Link to="/empleados/nuevo" className={primaryLinkClass}>
            Nuevo empleado
          </Link>
        }
      />
    );
  }

  return (
    <section aria-labelledby="group-workforce" className="space-y-3">
      <h2 id="group-workforce" className="text-lg font-semibold text-slate-900">
        Personal
      </h2>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de empleados" value={formatCount(workforce.total)} />
        <StatCard label="Activos" value={formatCount(workforce.active)} />
        <StatCard label="Suspendidos" value={formatCount(workforce.suspended)} />
        <StatCard label="Retirados" value={formatCount(workforce.retired)} />
      </dl>
      <p className="text-sm">
        <Link
          to="/empleados"
          className="text-blue-700 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
        >
          Ver listado de empleados
        </Link>
      </p>
    </section>
  );
}

function DashboardPage() {
  const query = useDashboard();
  const data = query.data;
  const isRefreshing = query.isFetching && !query.isPending;

  let statusText = '';
  if (isRefreshing) statusText = 'Actualizando…';
  else if (data) statusText = `Calculado el ${formatDateTime(data.generatedAt)}`;

  return (
    <section aria-labelledby="dashboard-title" className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 id="dashboard-title" className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>
          <p aria-live="polite" className="mt-1 min-h-5 text-sm text-slate-600">
            {statusText}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
          className={secondaryButtonClass}
        >
          Actualizar
        </button>
      </div>

      {query.isPending && <LoadingState label="Cargando indicadores…" />}

      {query.isError && (
        <ErrorAlert error={describeError(query.error)} onRetry={() => void query.refetch()} />
      )}

      {data && (
        <div aria-busy={isRefreshing} className={isRefreshing ? 'opacity-60 transition-opacity' : ''}>
          <WorkforceSection workforce={data.workforce} />
        </div>
      )}
    </section>
  );
}

export default DashboardPage;