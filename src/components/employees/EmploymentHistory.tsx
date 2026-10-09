import { useState } from 'react';
import { EmploymentStatusBadge } from '../EmployeeBadges';
import ErrorAlert from '../ErrorAlert';
import LoadingState from '../LoadingState';
import Pagination from '../Pagination';
import { useEmploymentHistory } from '../../hooks/useEmployees';
import { describeError } from '../../services/errorMessages';
import type { EmploymentHistoryEntry } from '../../types/employee';
import { DEFAULT_PAGE_SIZE, HISTORY_EVENT_LABELS, PAGE_SIZES } from '../../utils/employeeLabels';
import { formatDate, formatDateTime, formatMoney } from '../../utils/format';

interface EmploymentHistoryProps {
  employeeId: string;
}

function formatEffectiveAt(value: string): string {
  return value.endsWith('T00:00:00.000Z') ? formatDate(value) : formatDateTime(value);
}

const thClass = 'px-4 py-3 text-left text-xs font-semibold text-slate-600';

function HistoryTable({ items }: { items: EmploymentHistoryEntry[] }) {
  return (
    <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white lg:block">
      <table className="w-full min-w-[48rem] text-sm">
        <caption className="sr-only">Historial laboral</caption>
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th scope="col" className={thClass}>
              Evento
            </th>
            <th scope="col" className={thClass}>
              Vigente desde
            </th>
            <th scope="col" className={thClass}>
              Estado
            </th>
            <th scope="col" className={thClass}>
              Departamento y puesto
            </th>
            <th scope="col" className={thClass}>
              Salario base
            </th>
            <th scope="col" className={thClass}>
              Registrado por
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((entry) => (
            <tr key={entry.id}>
              <td className="px-4 py-3 font-medium text-slate-900">{HISTORY_EVENT_LABELS[entry.eventType]}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatEffectiveAt(entry.effectiveAt)}</td>
              <td className="px-4 py-3">
                <EmploymentStatusBadge status={entry.status} />
                {entry.terminationDate && (
                  <div className="mt-1 text-xs text-slate-600">Baja: {formatDate(entry.terminationDate)}</div>
                )}
              </td>
              <td className="px-4 py-3 text-slate-900">
                {entry.department.name}
                <div className="text-xs text-slate-600">{entry.position.name}</div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatMoney(entry.baseSalary)}</td>
              <td className="px-4 py-3 text-slate-700">
                <span className="break-all">{entry.changedBy?.email ?? '—'}</span>
                <div className="text-xs text-slate-600">{formatDateTime(entry.createdAt)}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HistoryCards({ items }: { items: EmploymentHistoryEntry[] }) {
  return (
    <ul aria-label="Historial laboral" className="space-y-3 lg:hidden">
      {items.map((entry) => (
        <li key={entry.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-slate-900">{HISTORY_EVENT_LABELS[entry.eventType]}</span>
            <EmploymentStatusBadge status={entry.status} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <div>
              <dt className="text-xs text-slate-600">Vigente desde</dt>
              <dd className="text-slate-900">{formatEffectiveAt(entry.effectiveAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-600">Salario base</dt>
              <dd className="text-slate-900">{formatMoney(entry.baseSalary)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-600">Departamento</dt>
              <dd className="text-slate-900">{entry.department.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-600">Puesto</dt>
              <dd className="text-slate-900">{entry.position.name}</dd>
            </div>
            {entry.terminationDate && (
              <div className="col-span-2">
                <dt className="text-xs text-slate-600">Fecha de baja</dt>
                <dd className="text-slate-900">{formatDate(entry.terminationDate)}</dd>
              </div>
            )}
            <div className="col-span-2">
              <dt className="text-xs text-slate-600">Registrado por</dt>
              <dd className="break-all text-slate-900">
                {entry.changedBy?.email ?? '—'} · {formatDateTime(entry.createdAt)}
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}

function EmploymentHistory({ employeeId }: EmploymentHistoryProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(DEFAULT_PAGE_SIZE);
  const query = useEmploymentHistory(employeeId, { page, limit });

  const renderContent = () => {
    if (query.isPending) return <LoadingState label="Cargando historial…" />;

    if (query.isError) {
      return <ErrorAlert error={describeError(query.error)} onRetry={() => void query.refetch()} />;
    }

    const { items, meta } = query.data;

    if (items.length === 0) {
      return (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600">
          Este empleado todavía no tiene eventos registrados.
        </p>
      );
    }

    return (
      <div aria-busy={query.isFetching} className={`space-y-4 transition-opacity ${query.isFetching ? 'opacity-60' : ''}`}>
        <HistoryTable items={items} />
        <HistoryCards items={items} />
        <Pagination
          meta={meta}
          pageSizes={PAGE_SIZES}
          disabled={query.isFetching}
          onPageChange={setPage}
          onLimitChange={(value) => {
            setLimit(value);
            setPage(1);
          }}
        />
      </div>
    );
  };

  return (
    <section aria-labelledby="history-title" className="space-y-3">
      <div>
        <h2 id="history-title" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span aria-hidden="true" className="h-5 w-1 rounded-full bg-blue-500" />
          Historial laboral
        </h2>
        <p className="text-sm text-slate-600">Los registros del historial no se pueden editar ni eliminar.</p>
      </div>
      {renderContent()}
    </section>
  );
}

export default EmploymentHistory;