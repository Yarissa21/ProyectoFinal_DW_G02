import { useState, type ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import EmptyState from '../EmptyState';
import ErrorAlert from '../ErrorAlert';
import LoadingState from '../LoadingState';
import Pagination from '../Pagination';
import ActiveBadge from './ActiveBadge';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { describeError } from '../../services/errorMessages';
import type { OrgListParams } from '../../types/organization';
import type { Paginated } from '../../types/pagination';
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '../../utils/employeeLabels';

export interface OrgColumn<T> {
  header: string;
  cell: (item: T) => ReactNode;
  primary?: boolean;
}

interface OrgSectionProps<T extends { id: string; isActive: boolean }> {
  singular: string;
  plural: string;
  feminine?: boolean;
  searchPlaceholder?: string;
  canToggle?: (item: T) => boolean;
  useList: (params: OrgListParams) => UseQueryResult<Paginated<T>, Error>;
  columns: OrgColumn<T>[];
  canManage: boolean;
  onCreate: () => void;
  onEdit: (item: T) => void;
  onToggle: (item: T) => void;
}

type StatusFilter = 'all' | 'active' | 'inactive';

const controlClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600';
const primaryButtonClass =
  'rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';
const secondaryButtonClass =
  'whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600';
const thClass = 'px-4 py-3 text-left text-xs font-semibold text-slate-600';

function OrgSection<T extends { id: string; isActive: boolean }>({
  singular,
  plural,
  feminine = false,
  searchPlaceholder = 'Código o nombre',
  canToggle = () => true,
  useList,
  columns,
  canManage,
  onCreate,
  onEdit,
  onToggle,
}: OrgSectionProps<T>) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const debouncedSearch = useDebouncedValue(search.trim());

  const query = useList({
    page,
    limit,
    search: debouncedSearch || undefined,
    isActive: status === 'all' ? undefined : status === 'active',
  });
  const data = query.data;
  const hasFilters = search.trim() !== '' || status !== 'all';
  const article = feminine ? 'una' : 'un';
  const primaryColumn = columns.find((column) => column.primary) ?? columns[0];

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setPage(1);
  };

  const rowActions = (item: T) => (
    <div className="flex gap-2">
      <button type="button" onClick={() => onEdit(item)} className={secondaryButtonClass}>
        Editar
      </button>
      {canToggle(item) && (
        <button type="button" onClick={() => onToggle(item)} className={secondaryButtonClass}>
          {item.isActive ? 'Desactivar' : 'Activar'}
        </button>
      )}
    </div>
  );

  const renderContent = () => {
    if (query.isPending) return <LoadingState label={`Cargando ${plural}…`} />;

    if (query.isError) {
      return <ErrorAlert error={describeError(query.error)} onRetry={() => void query.refetch()} />;
    }

    if (!data) return null;

    if (data.items.length === 0) {
      if (data.meta.totalItems > 0) {
        return (
          <EmptyState
            title="Esta página ya no tiene resultados."
            action={
              <button type="button" onClick={() => setPage(data.meta.totalPages)} className={secondaryButtonClass}>
                Ir a la última página
              </button>
            }
          />
        );
      }
      return hasFilters ? (
        <EmptyState
          title={`Ning${feminine ? 'una' : 'ún'} ${singular} coincide con la búsqueda.`}
          description="Prueba con otros términos o quita algún filtro."
          action={
            <button type="button" onClick={clearFilters} className={secondaryButtonClass}>
              Limpiar filtros
            </button>
          }
        />
      ) : (
        <EmptyState
          title={`Todavía no hay ${plural} registrad${feminine ? 'as' : 'os'}.`}
          description={canManage ? `Crea ${article} ${singular} para empezar.` : undefined}
          action={
            canManage ? (
              <button type="button" onClick={onCreate} className={primaryButtonClass}>
                Nuev{feminine ? 'a' : 'o'} {singular}
              </button>
            ) : undefined
          }
        />
      );
    }

    return (
      <div aria-busy={query.isFetching} className={`space-y-4 transition-opacity ${query.isFetching ? 'opacity-60' : ''}`}>
        <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white lg:block">
          <table className="w-full min-w-[48rem] text-sm">
            <caption className="sr-only">Listado de {plural}</caption>
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {columns.map((column) => (
                  <th key={column.header} scope="col" className={thClass}>
                    {column.header}
                  </th>
                ))}
                <th scope="col" className={thClass}>
                  Estado
                </th>
                {canManage && (
                  <th scope="col" className={thClass}>
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((item) => (
                <tr key={item.id}>
                  {columns.map((column) => (
                    <td key={column.header} className="px-4 py-3 align-top text-slate-900">
                      {column.cell(item)}
                    </td>
                  ))}
                  <td className="px-4 py-3 align-top">
                    <ActiveBadge active={item.isActive} feminine={feminine} />
                  </td>
                  {canManage && <td className="px-4 py-3 align-top">{rowActions(item)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul aria-label={`Listado de ${plural}`} className="space-y-3 lg:hidden">
          {data.items.map((item) => (
            <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 font-semibold text-slate-900">{primaryColumn.cell(item)}</div>
                <ActiveBadge active={item.isActive} feminine={feminine} />
              </div>
              <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                {columns
                  .filter((column) => column !== primaryColumn)
                  .map((column) => (
                    <div key={column.header}>
                      <dt className="text-xs text-slate-600">{column.header}</dt>
                      <dd className="break-words text-slate-900">{column.cell(item)}</dd>
                    </div>
                  ))}
              </dl>
              {canManage && <div className="mt-3">{rowActions(item)}</div>}
            </li>
          ))}
        </ul>

        <Pagination
          meta={data.meta}
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor={`org-search-${plural}`} className="mb-1.5 block text-sm font-medium text-slate-700">
            Buscar
          </label>
          <input
            id={`org-search-${plural}`}
            type="search"
            value={search}
            placeholder={searchPlaceholder}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className={controlClass}
          />
        </div>
        <div className="sm:w-44">
          <label htmlFor={`org-status-${plural}`} className="mb-1.5 block text-sm font-medium text-slate-700">
            Estado
          </label>
          <select
            id={`org-status-${plural}`}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusFilter);
              setPage(1);
            }}
            className={controlClass}
          >
            <option value="all">Todos</option>
            <option value="active">{feminine ? 'Activas' : 'Activos'}</option>
            <option value="inactive">{feminine ? 'Inactivas' : 'Inactivos'}</option>
          </select>
        </div>
        {canManage && (
          <button type="button" onClick={onCreate} className={primaryButtonClass}>
            + Nuev{feminine ? 'a' : 'o'} {singular}
          </button>
        )}
      </div>

      {renderContent()}
    </div>
  );
}

export default OrgSection;