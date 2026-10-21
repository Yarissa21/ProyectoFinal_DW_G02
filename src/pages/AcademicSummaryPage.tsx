import { useState } from 'react';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useAcademicSummary } from '../hooks/useAcademicSummary';
import { useEmployeeCatalogs } from '../hooks/useEmployeeCatalogs';
import { describeError } from '../services/errorMessages';
import type { AcademicSummaryParams, AcademicSummaryReport } from '../types/academicReport';
import type { EmploymentStatus } from '../types/employee';
import { ACADEMIC_TYPE_LABELS } from '../utils/academicLabels';
import { formatCount, formatPercentage } from '../utils/dashboardLabels';
import { EMPLOYMENT_STATUS_LABELS, EMPLOYMENT_STATUS_VALUES } from '../utils/employeeLabels';
import { formatDateTime } from '../utils/format';

const controlClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600';
const secondaryButtonClass =
  'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-60';
const textButtonClass =
  'rounded-md px-2 py-1 text-sm font-medium text-blue-800 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600';
const thClass = 'px-4 py-3 text-left text-xs font-semibold text-slate-600';
const numThClass = 'px-4 py-3 text-right text-xs font-semibold text-slate-600';

function typeLabel(key: string): string {
  return ACADEMIC_TYPE_LABELS[key as keyof typeof ACADEMIC_TYPE_LABELS] ?? key;
}

function percentOf(part: number, total: number): number {
  return total > 0 ? (part / total) * 100 : 0;
}

function SectionTitle({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="flex items-center gap-2 text-lg font-semibold text-slate-900">
      <span aria-hidden="true" className="h-5 w-1 rounded-full bg-blue-500" />
      {children}
    </h2>
  );
}

function CoverageBar({ report }: { report: AcademicSummaryReport }) {
  const value = Math.min(100, Math.max(0, Number(report.coveragePercentage) || 0));
  return (
    <section aria-labelledby="coverage-title" className="rounded-xl border border-slate-200 bg-white p-4">
      <SectionTitle id="coverage-title">Cobertura académica</SectionTitle>
      <p className="mt-2 text-sm text-slate-700">
        {formatCount(report.employeesWithRecords)} de {formatCount(report.totalEmployees)} empleados tienen al
        menos un registro académico ({formatPercentage(report.coveragePercentage)}).
      </p>
      <div
        role="progressbar"
        aria-label="Cobertura académica"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200"
      >
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${value}%` }} />
      </div>
    </section>
  );
}

function ByType({ report }: { report: AcademicSummaryReport }) {
  const rows = report.byType;
  return (
    <section aria-labelledby="by-type-title" className="rounded-xl border border-slate-200 bg-white p-4">
      <SectionTitle id="by-type-title">Registros por tipo</SectionTitle>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">Sin datos para mostrar.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {rows.map((row) => (
            <li key={row.key}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 break-words text-slate-700">{typeLabel(row.key)}</span>
                <span className="font-semibold text-slate-900">{formatCount(row.count)}</span>
              </div>
              <div aria-hidden="true" className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${percentOf(row.count, report.totalAcademicRecords)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TopInstitutions({ report }: { report: AcademicSummaryReport }) {
  const rows = report.topInstitutions;
  return (
    <section aria-labelledby="top-inst-title" className="rounded-xl border border-slate-200 bg-white p-4">
      <SectionTitle id="top-inst-title">Instituciones con más registros</SectionTitle>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">Sin datos para mostrar.</p>
      ) : (
        <ol className="mt-3 divide-y divide-slate-100">
          {rows.map((row, index) => (
            <li key={`${row.institution}-${index}`} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="min-w-0 break-words text-slate-700">
                <span className="mr-2 text-slate-500">{index + 1}.</span>
                {row.institution}
              </span>
              <span className="font-semibold text-slate-900">{formatCount(row.count)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function DepartmentCoverage({ report }: { report: AcademicSummaryReport }) {
  const rows = report.byDepartment;
  return (
    <section aria-labelledby="by-dept-title" className="space-y-3">
      <SectionTitle id="by-dept-title">Cobertura por departamento</SectionTitle>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Sin datos para mostrar.
        </p>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white lg:block">
            <table className="w-full min-w-[40rem] text-sm">
              <caption className="sr-only">Cobertura académica por sede y departamento</caption>
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th scope="col" className={thClass}>
                    Sede
                  </th>
                  <th scope="col" className={thClass}>
                    Departamento
                  </th>
                  <th scope="col" className={numThClass}>
                    Empleados
                  </th>
                  <th scope="col" className={numThClass}>
                    Con registros
                  </th>
                  <th scope="col" className={numThClass}>
                    Cobertura
                  </th>
                  <th scope="col" className={numThClass}>
                    Registros
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={`${row.branchId}-${row.departmentId}`}>
                    <td className="px-4 py-3 text-slate-700">{row.branchName}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.departmentName}</td>
                    <td className="px-4 py-3 text-right text-slate-800">{formatCount(row.employeeCount)}</td>
                    <td className="px-4 py-3 text-right text-slate-800">{formatCount(row.employeesWithRecords)}</td>
                    <td className="px-4 py-3 text-right text-slate-800">
                      {formatPercentage(String(percentOf(row.employeesWithRecords, row.employeeCount)))}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-800">{formatCount(row.recordCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul aria-label="Cobertura académica por departamento" className="space-y-3 lg:hidden">
            {rows.map((row) => (
              <li key={`${row.branchId}-${row.departmentId}`} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="font-semibold text-slate-900">{row.departmentName}</p>
                <p className="text-xs text-slate-600">{row.branchName}</p>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-slate-600">Empleados</dt>
                    <dd className="text-slate-900">{formatCount(row.employeeCount)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-600">Con registros</dt>
                    <dd className="text-slate-900">{formatCount(row.employeesWithRecords)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-600">Cobertura</dt>
                    <dd className="text-slate-900">
                      {formatPercentage(String(percentOf(row.employeesWithRecords, row.employeeCount)))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-600">Registros</dt>
                    <dd className="text-slate-900">{formatCount(row.recordCount)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function SummaryContent({ report, hasFilters, onClear }: { report: AcademicSummaryReport; hasFilters: boolean; onClear: () => void }) {
  if (report.totalEmployees === 0) {
    return hasFilters ? (
      <EmptyState
        title="No hay empleados que coincidan con los filtros."
        action={
          <button type="button" onClick={onClear} className={textButtonClass}>
            Quitar filtros
          </button>
        }
      />
    ) : (
      <EmptyState
        title="Todavía no hay empleados registrados."
        description="El consolidado se llenará cuando se registre el primer empleado."
      />
    );
  }

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard tone="brand" label="Empleados incluidos" value={formatCount(report.totalEmployees)} />
        <StatCard tone="success" label="Con registros" value={formatCount(report.employeesWithRecords)} />
        <StatCard tone="warning" label="Sin registros" value={formatCount(report.employeesWithoutRecords)} />
        <StatCard tone="info" label="Registros académicos" value={formatCount(report.totalAcademicRecords)} />
        <StatCard
          tone="success"
          label="Cobertura"
          value={<span className="text-2xl break-words">{formatPercentage(report.coveragePercentage)}</span>}
        />
      </dl>

      <CoverageBar report={report} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ByType report={report} />
        <TopInstitutions report={report} />
      </div>

      <DepartmentCoverage report={report} />
    </div>
  );
}

function AcademicSummaryPage() {
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState<EmploymentStatus | ''>('');

  const params: AcademicSummaryParams = {
    departmentId: departmentId || undefined,
    status: status || undefined,
  };
  const query = useAcademicSummary(params);
  const catalogs = useEmployeeCatalogs();

  const hasFilters = departmentId !== '' || status !== '';
  const clearFilters = () => {
    setDepartmentId('');
    setStatus('');
  };

  const data = query.data;
  const isRefreshing = query.isFetching && !query.isPending;

  let statusText = '';
  if (isRefreshing) statusText = 'Actualizando…';
  else if (data) statusText = `Generado el ${formatDateTime(data.generatedAt)}`;

  return (
    <section aria-labelledby="academic-summary-title" className="space-y-6">
      <PageHeader
        id="academic-summary-title"
        title="Resumen académico"
        description={statusText}
        actions={
          <button type="button" onClick={() => void query.refetch()} disabled={query.isFetching} className={secondaryButtonClass}>
            Actualizar
          </button>
        }
      />

      <form
        aria-label="Filtros del resumen académico"
        onSubmit={(event) => event.preventDefault()}
        className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <div>
          <label htmlFor="summary-department" className="mb-1.5 block text-sm font-medium text-slate-700">
            Departamento
          </label>
          <select
            id="summary-department"
            value={departmentId}
            onChange={(event) => setDepartmentId(event.target.value)}
            disabled={catalogs.isPending}
            aria-describedby={catalogs.isError ? 'summary-department-error' : undefined}
            className={controlClass}
          >
            <option value="">Todos</option>
            {catalogs.data?.departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
          {catalogs.isError && (
            <p id="summary-department-error" role="alert" className="mt-1 text-xs text-red-700">
              No se pudieron cargar los departamentos.
            </p>
          )}
        </div>
        <div>
          <label htmlFor="summary-status" className="mb-1.5 block text-sm font-medium text-slate-700">
            Estado laboral
          </label>
          <select
            id="summary-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as EmploymentStatus | '')}
            className={controlClass}
          >
            <option value="">Todos</option>
            {EMPLOYMENT_STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {EMPLOYMENT_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <div>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className={textButtonClass}>
              Limpiar filtros
            </button>
          )}
        </div>
      </form>

      {query.isPending && <LoadingState label="Cargando resumen académico…" />}

      {query.isError && <ErrorAlert error={describeError(query.error)} onRetry={() => void query.refetch()} />}

      {data && (
        <div aria-busy={isRefreshing} className={isRefreshing ? 'opacity-60 transition-opacity' : ''}>
          <SummaryContent report={data} hasFilters={hasFilters} onClear={clearFilters} />
        </div>
      )}
    </section>
  );
}

export default AcademicSummaryPage;
