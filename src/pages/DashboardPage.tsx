import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useDashboard } from '../hooks/useDashboard';
import { describeError } from '../services/errorMessages';
import { formatCount, formatPercentage, PAYROLL_STATUS_LABELS } from '../utils/dashboardLabels';
import { formatDate, formatDateTime } from '../utils/format';
import type { DashboardReport, DashboardWorkforce } from '../types/dashboard';

const secondaryButtonClass =
  'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-60';
const primaryLinkClass =
  'inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

function SectionTitle({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="flex items-center gap-2 text-lg font-semibold text-slate-900">
      <span aria-hidden="true" className="h-5 w-1 rounded-full bg-blue-500" />
      {children}
    </h2>
  );
}

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
      <SectionTitle id="group-workforce">Personal</SectionTitle>
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

function OtherSections({ data }: { data: DashboardReport }) {
  const { records, leaveRequests, documents, latestPayrollPeriod } = data;

  return (
    <>
      <section aria-labelledby="group-records" className="space-y-3">
        <SectionTitle id="group-records">Expedientes</SectionTitle>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard tone="success" label="Completos" value={formatCount(records.complete)} />
          <StatCard tone="info" label="En proceso" value={formatCount(records.inProgress)} />
          <StatCard tone="danger" label="Incompletos" value={formatCount(records.incomplete)} />
          <StatCard
            tone="brand"
            label="Cumplimiento"
            value={formatPercentage(records.compliancePercentage)}
          />
        </dl>
      </section>

      <section aria-labelledby="group-leave" className="space-y-3">
        <SectionTitle id="group-leave">Solicitudes de ausencia</SectionTitle>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatCard tone="warning" label="Pendientes" value={formatCount(leaveRequests.pending)} />
          <StatCard
            tone="info"
            label="Aprobadas próximas"
            value={formatCount(leaveRequests.upcomingApproved)}
          />
        </dl>
      </section>

      <section aria-labelledby="group-documents" className="space-y-3">
        <SectionTitle id="group-documents">Documentos</SectionTitle>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatCard tone="danger" label="Vencidos" value={formatCount(documents.expired)} />
          <StatCard
            tone="warning"
            label="Vencen en 30 días"
            value={formatCount(documents.expiringNext30Days)}
          />
        </dl>
      </section>

      <section aria-labelledby="group-payroll" className="space-y-3">
        <SectionTitle id="group-payroll">Último periodo de nómina</SectionTitle>
        {latestPayrollPeriod ? (
          <article className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <h3 className="text-base font-semibold text-slate-900">{latestPayrollPeriod.name}</h3>
            <dl className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div>
                <dt className="font-medium text-slate-700">Estado</dt>
                <dd>{PAYROLL_STATUS_LABELS[latestPayrollPeriod.status] ?? latestPayrollPeriod.status}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700">Fecha de pago</dt>
                <dd>{formatDate(latestPayrollPeriod.paymentDate)}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700">Empleados</dt>
                <dd>{formatCount(latestPayrollPeriod.employeeCount)}</dd>
              </div>
            </dl>
          </article>
        ) : (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Todavía no hay periodos de nómina registrados.
          </p>
        )}
      </section>
    </>
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
        <div
          aria-busy={isRefreshing}
          className={`space-y-8 ${isRefreshing ? 'opacity-60 transition-opacity' : ''}`}
        >
          <WorkforceSection workforce={data.workforce} />
          <OtherSections data={data} />
        </div>
      )}
    </section>
  );
}

export default DashboardPage;