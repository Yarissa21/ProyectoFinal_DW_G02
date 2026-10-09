import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
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
      <h2 id="group-workforce" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <span aria-hidden="true" className="h-5 w-1 rounded-full bg-blue-500" />
        Personal
      </h2>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard tone="brand" label="Total de empleados" value={formatCount(workforce.total)} />
        <StatCard tone="success" label="Activos" value={formatCount(workforce.active)} />
        <StatCard tone="warning" label="Suspendidos" value={formatCount(workforce.suspended)} />
        <StatCard tone="danger" label="Retirados" value={formatCount(workforce.retired)} />
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
      <PageHeader
        id="dashboard-title"
        title="Dashboard"
        description={statusText}
        actions={
          <button
            type="button"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
            className={secondaryButtonClass}
          >
            Actualizar
          </button>
        }
      />

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