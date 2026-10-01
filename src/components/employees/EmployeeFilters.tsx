import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import ErrorAlert from '../ErrorAlert';
import { describeError } from '../../services/errorMessages';
import type { EmployeeListState } from '../../hooks/useEmployeeListParams';
import type { EmployeeCatalogs } from '../../types/catalog';
import type { EmployeeSortField, EmploymentStatus, RecordStatus } from '../../types/employee';
import type { SortOrder } from '../../types/pagination';
import {
  EMPLOYMENT_STATUS_LABELS,
  EMPLOYMENT_STATUS_VALUES,
  RECORD_STATUS_LABELS,
  RECORD_STATUS_VALUES,
  SORT_FIELD_LABELS,
  SORT_FIELD_VALUES,
} from '../../utils/employeeLabels';

interface EmployeeFiltersProps {
  params: EmployeeListState;
  catalogs: UseQueryResult<EmployeeCatalogs, Error>;
  hasActiveFilters: boolean;
  onChange: (changes: Partial<EmployeeListState>) => void;
  onClear: () => void;
}

const SEARCH_DEBOUNCE_MS = 400;

const controlClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-slate-50 disabled:text-slate-500';

function Field({ id, label, className = '', children }: { id: string; label: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function EmployeeFilters({ params, catalogs, hasActiveFilters, onChange, onClear }: EmployeeFiltersProps) {
  const urlSearch = params.search ?? '';
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [syncedSearch, setSyncedSearch] = useState(urlSearch);
  const timer = useRef<number | undefined>(undefined);

  if (urlSearch !== syncedSearch) {
    setSyncedSearch(urlSearch);
    setSearchInput(urlSearch);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const applySearch = (value: string) => {
    const clean = value.trim();
    setSyncedSearch(clean);
    onChange({ search: clean || undefined });
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => applySearch(value), SEARCH_DEBOUNCE_MS);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    window.clearTimeout(timer.current);
    applySearch(searchInput);
  };

  const handleClear = () => {
    window.clearTimeout(timer.current);
    setSearchInput('');
    setSyncedSearch('');
    onClear();
  };

  const departments = catalogs.data?.departments ?? [];
  const allPositions = catalogs.data?.positions ?? [];
  const positions = params.departmentId
    ? allPositions.filter((position) => position.departmentIds.includes(params.departmentId as string))
    : allPositions;

  const catalogPlaceholder = catalogs.isPending ? 'Cargando…' : 'No disponible';
  const catalogsUnavailable = !catalogs.data;

  return (
    <form
      role="search"
      aria-label="Buscar y filtrar empleados"
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-4"
    >
      {catalogs.isError && (
        <ErrorAlert compact error={describeError(catalogs.error)} onRetry={() => void catalogs.refetch()} />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field id="emp-search" label="Buscar" className="sm:col-span-2">
          <input
            id="emp-search"
            type="search"
            value={searchInput}
            onChange={(event) => handleSearchInput(event.target.value)}
            placeholder="Escribe para buscar"
            autoComplete="off"
            className={controlClass}
          />
        </Field>

        <Field id="emp-sort" label="Ordenar por">
          <select
            id="emp-sort"
            value={params.sortBy ?? ''}
            onChange={(event) => {
              const sortBy = (event.target.value || undefined) as EmployeeSortField | undefined;
              onChange({ sortBy, sortOrder: sortBy ? (params.sortOrder ?? 'asc') : undefined });
            }}
            className={controlClass}
          >
            <option value="">Predeterminado</option>
            {SORT_FIELD_VALUES.map((field) => (
              <option key={field} value={field}>
                {SORT_FIELD_LABELS[field]}
              </option>
            ))}
          </select>
        </Field>

        <Field id="emp-order" label="Orden">
          <select
            id="emp-order"
            value={params.sortOrder ?? 'asc'}
            disabled={!params.sortBy}
            onChange={(event) => onChange({ sortOrder: event.target.value as SortOrder })}
            className={controlClass}
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </Field>

        <Field id="emp-status" label="Estado laboral">
          <select
            id="emp-status"
            value={params.status ?? ''}
            onChange={(event) => onChange({ status: (event.target.value || undefined) as EmploymentStatus | undefined })}
            className={controlClass}
          >
            <option value="">Todos</option>
            {EMPLOYMENT_STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {EMPLOYMENT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>

        <Field id="emp-record" label="Expediente">
          <select
            id="emp-record"
            value={params.recordStatus ?? ''}
            onChange={(event) =>
              onChange({ recordStatus: (event.target.value || undefined) as RecordStatus | undefined })
            }
            className={controlClass}
          >
            <option value="">Todos</option>
            {RECORD_STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {RECORD_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>

        <Field id="emp-department" label="Departamento">
          <select
            id="emp-department"
            value={params.departmentId ?? ''}
            disabled={catalogsUnavailable}
            onChange={(event) =>
              onChange({ departmentId: event.target.value || undefined, positionId: undefined })
            }
            className={controlClass}
          >
            <option value="">{catalogsUnavailable ? catalogPlaceholder : 'Todos'}</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </Field>

        <Field id="emp-position" label="Puesto">
          <select
            id="emp-position"
            value={params.positionId ?? ''}
            disabled={catalogsUnavailable}
            onChange={(event) => onChange({ positionId: event.target.value || undefined })}
            className={controlClass}
          >
            <option value="">{catalogsUnavailable ? catalogPlaceholder : 'Todos'}</option>
            {positions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </form>
  );
}

export default EmployeeFilters;