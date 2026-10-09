import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useEmployeesSummary } from '../hooks/useEmployees';
import { describeError } from '../services/errorMessages';
import { formatCount } from '../utils/dashboardLabels';
import { EMPLOYMENT_STATUS_LABELS } from '../utils/employeeLabels';
import { formatDateTime, formatMoney } from '../utils/format';
import type { EmployeeSummaryReport } from '../types/employee';

const secondaryButtonClass =
  'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-60';
const primaryLinkClass =
  'inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

function statusLabel(key: string): string {
  return EMPLOYMENT_STATUS_LABELS[key as keyof typeof EMPLOYMENT_STATUS_LABELS] ?? key;
}

function CountList({ title, id, rows }: { title: string; id: string; rows: { key: string; label: string; count: number }[] }) {
  return (
    <section aria-labelledby={id} className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 id={id} className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <span aria-hidden="true" className="h-5 w-1 rounded-full bg-blue-500" />
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">Sin datos para mostrar.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {rows.map((row) => (
            <li key={row.key} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="min-w-0 break-words text-slate-700">{row.label}</span>
              <span className="font-semibold text-slate-900">{formatCount(row.count)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SummaryContent({ data }: { data: EmployeeSummaryReport }) {
  if (data.totalEmployees === 0) {
    return (
      <EmptyState
        title="Todavía no hay empleados registrados."
        description="El reporte se llenará cuando se registre el primer empleado."
        action={
          <Link to="/empleados/nuevo" className={primaryLinkClass}>
            Nuevo empleado
          </Link>
        }
      />
    );
  }

  const statusRows = data.byEmploymentStatus.map((item) => ({
    key: item.key,
    label: statusLabel(item.key),
    count: item.count,
  }));
  const departmentRows = data.byDepartment.map((item) => ({
    key: item.id,
    label: `${item.name} (${item.code})`,
    count: item.count,
  }));

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard tone="brand" label="Total de empleados" value={formatCount(data.totalEmployees)} />
        <StatCard tone="success" label="Activos" value={formatCount(data.activeEmployees)} />
        <StatCard tone="danger" label="Inactivos" value={formatCount(data.inactiveEmployees)} />
        <StatCard
          tone="info"
          label="Planilla mensual base"
          value={<span className="text-2xl break-words">{formatMoney(data.monthlyPayrollBase)}</span>}
        />
      </dl>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CountList title="Por estado laboral" id="summary-status" rows={statusRows} />
        <CountList title="Por departamento" id="summary-department" rows={departmentRows} />
      </div>
    </div>
  );
}

function EmployeesSummaryPage() {
  const query = useEmployeesSummary();
  const data = query.data;
  const isRefreshing = query.isFetching && !query.isPending;

  let statusText = '';
  if (isRefreshing) statusText = 'Actualizando…';
  else if (data) statusText = `Generado el ${formatDateTime(data.generatedAt)}`;

  return (
    <section aria-labelledby="summary-title" className="space-y-6">
      <PageHeader
        id="summary-title"
        title="Resumen de empleados"
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

      {query.isPending && <LoadingState label="Cargando reporte…" />}

      {query.isError && (
        <ErrorAlert error={describeError(query.error)} onRetry={() => void query.refetch()} />
      )}

      {data && (
        <div aria-busy={isRefreshing} className={isRefreshing ? 'opacity-60 transition-opacity' : ''}>
          <SummaryContent data={data} />
        </div>
      )}
    </section>
  );
}

export default EmployeesSummaryPage;