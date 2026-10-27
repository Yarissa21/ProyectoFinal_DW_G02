import { useRef, useState } from 'react';
import DocumentTypeDialog from '../components/documentTypes/DocumentTypeDialog';
import DocumentTypeStatusDialog from '../components/documentTypes/DocumentTypeStatusDialog';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import LoadingState from '../components/LoadingState';
import ActiveBadge from '../components/organization/ActiveBadge';
import PageHeader from '../components/PageHeader';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useDocumentTypes } from '../hooks/useDocuments';
import toast from 'react-hot-toast';
import { describeError } from '../services/errorMessages';
import { useAuthStore } from '../store/authStore';
import type { DocumentType } from '../types/document';
import { SortButton, SortHeader } from '../components/SortHeader';
import type { SortOrder } from '../types/pagination';

type DialogState = { type: 'form'; documentType?: DocumentType } | { type: 'status'; documentType: DocumentType } | null;
type StatusFilter = 'all' | 'active' | 'inactive';

const thClass = 'px-4 py-3 text-left text-xs font-semibold text-slate-600';
const controlClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600';
const primaryButtonClass =
  'rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';
const clearButtonClass =
  'whitespace-nowrap rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600';
const secondaryButtonClass =
  'whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600';

function RequiredBadge({ required }: { required: boolean }) {
  return required ? (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">Obligatorio</span>
  ) : (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">Opcional</span>
  );
}

function DocumentTypesPage() {
  const canManage = useAuthStore((state) => state.user?.role.code === 'ADMIN');
  const [dialog, setDialog] = useState<DialogState>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase());

  const query = useDocumentTypes(canManage);

  const hasFilters = search.trim() !== '' || status !== 'all';

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    searchRef.current?.focus();
  };

  const toggleSort = () => {
    setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
  };

  const close = () => setDialog(null);
  const saved = (message: string) => {
    setDialog(null);
    toast.success(message);
  };

  const openDialog = (next: DialogState) => {
    setDialog(next);
  };

  const rowActions = (documentType: DocumentType) => (
    <div className="flex gap-2">
      <button type="button" onClick={() => openDialog({ type: 'form', documentType })} className={secondaryButtonClass}>
        Editar
      </button>
      <button type="button" onClick={() => openDialog({ type: 'status', documentType })} className={secondaryButtonClass}>
        {documentType.isActive ? 'Desactivar' : 'Activar'}
      </button>
    </div>
  );

  const renderContent = () => {
    if (query.isPending) return <LoadingState label="Cargando tipos de documento…" />;

    if (query.isError) {
      return <ErrorAlert error={describeError(query.error)} onRetry={() => void query.refetch()} />;
    }

    const items = query.data.filter((item) => {
      if (status === 'active' && !item.isActive) return false;
      if (status === 'inactive' && item.isActive) return false;
      if (!debouncedSearch) return true;
      return (
        item.name.toLowerCase().includes(debouncedSearch) ||
        (item.description ?? '').toLowerCase().includes(debouncedSearch)
      );
    });

    if (sortOrder) {
      items.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }) * (sortOrder === 'asc' ? 1 : -1));
    }

    if (items.length === 0) {
      return hasFilters ? (
        <EmptyState
          title="Ningún tipo coincide con la búsqueda."
          description="Prueba con otros términos o quita algún filtro."
          action={
            <button type="button" onClick={clearFilters} className={secondaryButtonClass}>
              Limpiar filtros
            </button>
          }
        />
      ) : (
        <EmptyState
          title="Todavía no hay tipos de documento."
          description={canManage ? 'Crea uno para empezar.' : undefined}
          action={
            canManage ? (
              <button type="button" onClick={() => openDialog({ type: 'form' })} className={primaryButtonClass}>
                Nuevo tipo
              </button>
            ) : undefined
          }
        />
      );
    }

    return (
      <div aria-busy={query.isFetching} className={`space-y-4 transition-opacity ${query.isFetching ? 'opacity-60' : ''}`}>
        <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white lg:block">
          <table className="w-full min-w-[40rem] text-sm">
            <caption className="sr-only">Listado de tipos de documento</caption>
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <SortHeader label="Nombre" active={sortOrder !== null} order={sortOrder ?? undefined} onClick={toggleSort} />
                <th scope="col" className={thClass}>
                  Descripción
                </th>
                <th scope="col" className={thClass}>
                  Obligatoriedad
                </th>
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
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 align-top font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 align-top text-slate-700">{item.description || '—'}</td>
                  <td className="px-4 py-3 align-top">
                    <RequiredBadge required={item.isRequired} />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <ActiveBadge active={item.isActive} />
                  </td>
                  {canManage && <td className="px-4 py-3 align-top">{rowActions(item)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul aria-label="Listado de tipos de documento" className="space-y-3 lg:hidden">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <span className="min-w-0 break-words font-semibold text-slate-900">{item.name}</span>
                <ActiveBadge active={item.isActive} />
              </div>
              <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-slate-600">Obligatoriedad</dt>
                  <dd>
                    <RequiredBadge required={item.isRequired} />
                  </dd>
                </div>
                {item.description && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-slate-600">Descripción</dt>
                    <dd className="text-slate-900">{item.description}</dd>
                  </div>
                )}
              </dl>
              {canManage && <div className="mt-3">{rowActions(item)}</div>}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <section aria-labelledby="document-types-title" className="space-y-5">
      <PageHeader
        id="document-types-title"
        title="Tipos de documento"
        description={
          canManage
            ? 'Define los tipos de documento que se pueden subir al expediente de los empleados.'
            : 'Consulta los tipos de documento del expediente. Solo un administrador puede modificarlos.'
        }
        actions={
          canManage ? (
            <button type="button" onClick={() => openDialog({ type: 'form' })} className={primaryButtonClass}>
              + Nuevo tipo
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="doctype-search" className="mb-1.5 block text-sm font-medium text-slate-700">
            Buscar
          </label>
          <input
            ref={searchRef}
            id="doctype-search"
            type="search"
            value={search}
            placeholder="Nombre o descripción"
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            className={controlClass}
          />
        </div>
        {canManage && (
          <div className="sm:w-44">
            <label htmlFor="doctype-status" className="mb-1.5 block text-sm font-medium text-slate-700">
              Estado
            </label>
            <select
              id="doctype-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as StatusFilter);
              }}
              className={controlClass}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        )}
        {hasFilters && (
          <button type="button" onClick={clearFilters} className={clearButtonClass}>
            Limpiar filtros
          </button>
        )}
      </div>
      <div role="group" aria-label="Ordenar tipos de documento por" className="flex items-center gap-2 lg:hidden">
        <span className="text-sm font-medium text-slate-700">Ordenar:</span>
        <SortButton label="Nombre" active={sortOrder !== null} order={sortOrder ?? undefined} onClick={toggleSort} />
      </div>

      {renderContent()}

      {dialog?.type === 'form' && (
        <DocumentTypeDialog
          key={dialog.documentType?.id ?? 'new'}
          documentType={dialog.documentType}
          onClose={close}
          onSaved={saved}
        />
      )}
      {dialog?.type === 'status' && (
        <DocumentTypeStatusDialog documentType={dialog.documentType} onClose={close} onSaved={saved} />
      )}
    </section>
  );
}

export default DocumentTypesPage;