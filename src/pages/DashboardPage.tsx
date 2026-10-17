import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatGroup from '../components/StatGroup';
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
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard compact tone="brand" label="Total de empleados" value={formatCount(workforce.total)} />
        <StatCard compact tone="success" label="Activos" value={formatCount(workforce.active)} />
        <StatCard compact tone="warning" label="Suspendidos" value={formatCount(workforce.suspended)} />
        <StatCard compact tone="danger" label="Retirados" value={formatCount(workforce.retired)} />
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
  const compliance = Math.min(100, Math.max(0, Number(records.compliancePercentage) || 0));

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatGroup
          id="group-records"
          title="Expedientes"
          rows={[
            { label: 'Completos', value: formatCount(records.complete) },
            { label: 'En proceso', value: formatCount(records.inProgress) },
            { label: 'Incompletos', value: formatCount(records.incomplete) },
            { label: 'Cumplimiento', value: formatPercentage(records.compliancePercentage) },
          ]}
        >
          <div
            role="progressbar"
            aria-label="Cumplimiento de expedientes"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={compliance}
            className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
          >
            <div className="h-full rounded-full bg-blue-500" style={{ width: `${compliance}%` }} />
          </div>
        </StatGroup>

        <StatGroup
          id="group-leave"
          title="Solicitudes de ausencia"
          rows={[
            { label: 'Pendientes', value: formatCount(leaveRequests.pending) },
            { label: 'Aprobadas próximas', value: formatCount(leaveRequests.upcomingApproved) },
          ]}
        />

        <StatGroup
          id="group-documents"
          title="Documentos"
          rows={[
            { label: 'Vencidos', value: formatCount(documents.expired) },
            { label: 'Vencen en 30 días', value: formatCount(documents.expiringNext30Days) },
          ]}
        />
      </div>

      <section aria-labelledby="group-payroll" className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 id="group-payroll" className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <span aria-hidden="true" className="h-4 w-1 rounded-full bg-blue-500" />
          Último periodo de nómina
        </h2>
        {latestPayrollPeriod ? (
          <>
            <p className="mt-2 break-words text-sm font-medium text-slate-900">{latestPayrollPeriod.name}</p>
            <dl className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
              <div className="flex gap-1">
                <dt>Estado:</dt>
                <dd className="font-semibold text-slate-900">
                  {PAYROLL_STATUS_LABELS[latestPayrollPeriod.status] ?? latestPayrollPeriod.status}
                </dd>
              </div>
              <div className="flex gap-1">
                <dt>Pago:</dt>
                <dd className="font-semibold text-slate-900">{formatDate(latestPayrollPeriod.paymentDate)}</dd>
              </div>
              <div className="flex gap-1">
                <dt>Empleados:</dt>
                <dd className="font-semibold text-slate-900">{formatCount(latestPayrollPeriod.employeeCount)}</dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-600">Todavía no hay periodos de nómina registrados.</p>
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
          className={`space-y-4 ${isRefreshing ? 'opacity-60 transition-opacity' : ''}`}
        >
          <WorkforceSection workforce={data.workforce} />
          <OtherSections data={data} />
        </div>
      )}
    </section>
  );
}

export default DashboardPage;