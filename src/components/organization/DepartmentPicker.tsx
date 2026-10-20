import { useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useDepartments, useDepartmentsById } from '../../hooks/useOrganization';
import type { BranchSummary } from '../../types/organization';

const LIST_LIMIT = 20;

interface DepartmentPickerProps {
  selected: string[];
  initial: BranchSummary[];
  error?: string;
  onChange: (ids: string[]) => void;
}

interface Option {
  name: string;
  branch?: string;
  inactive?: boolean;
}

function labelOf(option: Option): string {
  return `${option.name}${option.branch ? ` · ${option.branch}` : ''}${option.inactive ? ' (inactivo)' : ''}`;
}

function DepartmentPicker({ selected, initial, error, onChange }: DepartmentPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<Record<string, Option>>({});
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const debouncedSearch = useDebouncedValue(search.trim());
  const query = useDepartments({ isActive: true, limit: LIST_LIMIT, search: debouncedSearch || undefined });
  const items = query.data?.items ?? [];
  const total = query.data?.meta.totalItems ?? 0;

  const details = useDepartmentsById(initial.map((item) => item.id));

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const describe = (id: string): Option => {
    if (picked[id]) return picked[id];
    const detail = details.map((item) => item.data).find((item) => item?.id === id);
    if (detail) return { name: detail.name, branch: detail.branch.name, inactive: !detail.isActive };
    const summary = initial.find((item) => item.id === id);
    if (summary) return { name: summary.name, inactive: !summary.isActive };
    return { name: 'Departamento' };
  };

  const remove = (id: string) => onChange(selected.filter((item) => item !== id));

  const close = () => {
    setOpen(false);
    setSearch('');
    triggerRef.current?.focus();
  };

  const toggle = (id: string, option: Option) => {
    if (selected.includes(id)) {
      remove(id);
      return;
    }
    setPicked((current) => ({ ...current, [id]: option }));
    onChange([id]);
    close();
  };

  const summary =
    selected.length === 0
      ? 'Selecciona un departamento'
      : selected.length === 1
        ? labelOf(describe(selected[0]))
        : `${selected.length} departamentos seleccionados`;

  return (
    <fieldset aria-describedby={error ? 'pos-departments-error' : 'pos-departments-hint'}>
      <legend className="mb-1.5 text-sm font-medium text-slate-700">
        Departamento donde se habilita
        <span aria-hidden="true" className="ml-0.5 text-red-700">
          *
        </span>
      </legend>
      <p id="pos-departments-hint" className="mb-2 text-xs text-slate-600">
        Elige el departamento activo donde se habilitará el puesto.
      </p>

      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="pos-departments-panel"
        onClick={() => (open ? close() : setOpen(true))}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${error ? 'border-red-600' : 'border-slate-300'} ${selected.length === 0 ? 'text-slate-600' : 'text-slate-900'}`}
      >
        {summary}
        <span aria-hidden="true" className="text-xs text-slate-600">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div id="pos-departments-panel" className="mt-1 rounded-lg border border-slate-300 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-2">
            <label htmlFor="pos-departments-search" className="sr-only">
              Buscar departamento
            </label>
            <input
              ref={searchRef}
              id="pos-departments-search"
              type="search"
              value={search}
              placeholder="Buscar por nombre o código"
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.preventDefault();
                if (event.key === 'Escape') {
                  event.preventDefault();
                  event.stopPropagation();
                  close();
                }
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            />
          </div>

          <div aria-busy={query.isFetching} className={`max-h-52 overflow-y-auto ${query.isFetching ? 'opacity-70' : ''}`}>
            {query.isPending && <p className="px-3 py-2 text-sm text-slate-600">Cargando departamentos…</p>}
            {query.isError && (
              <p role="alert" className="px-3 py-2 text-sm text-red-700">
                No se pudieron cargar los departamentos.{' '}
                <button type="button" onClick={() => void query.refetch()} className="font-medium underline">
                  Reintentar
                </button>
              </p>
            )}
            {query.data && items.length === 0 && (
              <p className="px-3 py-2 text-sm text-slate-600">Ningún departamento activo coincide con la búsqueda.</p>
            )}
            {items.length > 0 && (
              <ul className="divide-y divide-slate-100">
                {items.map((item) => {
                  const isSelected = selected.includes(item.id);
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggle(item.id, { name: item.name, branch: item.branch.name })}
                        className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 ${isSelected ? 'bg-blue-50' : ''}`}
                      >
                        <span>
                          {item.name}
                          <span className="block text-xs text-slate-600">
                            Sede: {item.branch.name} · {item.code}
                          </span>
                        </span>
                        {isSelected && (
                          <span className="shrink-0 text-xs font-medium text-blue-800">✓ Seleccionado</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-3 py-1 text-xs text-slate-600">
            <span aria-live="polite">
              {total > items.length
                ? `Mostrando ${items.length} de ${total}. Escribe para filtrar.`
                : `${total} departamento${total === 1 ? '' : 's'}`}
            </span>
            <button
              type="button"
              onClick={close}
              className="rounded px-3 py-2 font-medium text-slate-800 underline hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {selected.length > 1 && (
        <ul aria-label="Departamentos seleccionados" className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((id) => {
            const label = labelOf(describe(id));
            return (
              <li
                key={id}
                className="flex items-center gap-1 rounded-full bg-slate-100 py-0.5 pl-3 pr-1 text-sm text-slate-900"
              >
                {label}
                <button
                  type="button"
                  onClick={() => remove(id)}
                  aria-label={`Quitar ${label}`}
                  className="flex size-6 items-center justify-center rounded-full text-slate-700 hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p id="pos-departments-error" role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export default DepartmentPicker;