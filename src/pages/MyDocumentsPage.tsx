import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import NotLinkedNotice, { NOT_LINKED_CODE } from '../components/selfService/NotLinkedNotice';
import { useMyDocuments } from '../hooks/useMyDocuments';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { describeError, toastOrReport, type ErrorDescription } from '../services/errorMessages';
import { fetchMyDocumentFile } from '../services/myDocumentService';
import type { MyDocument } from '../types/document';
import { canPreviewDocument, formatFileSize, openBlobInTab, saveBlob } from '../utils/documentFiles';
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '../utils/employeeLabels';
import { formatDate, formatDateTime } from '../utils/format';

const thClass = 'px-4 py-3 text-left text-xs font-semibold text-slate-600';
const controlClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600';
const secondaryButtonClass =
  'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600';
const textButtonClass =
  'rounded-md px-2 py-1 text-sm font-medium text-blue-800 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600';
const rowButtonClass =
  'rounded-md px-2 py-1 text-sm font-medium text-blue-800 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-50';

interface RowActionsProps {
  document: MyDocument;
  busy: boolean;
  onView: (document: MyDocument) => void;
  onDownload: (document: MyDocument) => void;
}

function RowActions({ document, busy, onView, onDownload }: RowActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {canPreviewDocument(document.mimeType) && (
        <button
          type="button"
          onClick={() => onView(document)}
          disabled={busy}
          aria-label={`Ver ${document.originalName}`}
          className={rowButtonClass}
        >
          Ver
        </button>
      )}
      <button
        type="button"
        onClick={() => onDownload(document)}
        disabled={busy}
        aria-label={`Descargar ${document.originalName}`}
        className={rowButtonClass}
      >
        Descargar
      </button>
    </div>
  );
}

type ActionHandlers = Omit<RowActionsProps, 'document'>;

function DocumentsTable({ items, ...actions }: { items: MyDocument[] } & ActionHandlers) {
  return (
    <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white lg:block">
      <table className="w-full min-w-[40rem] text-sm">
        <caption className="sr-only">Mis documentos</caption>
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th scope="col" className={thClass}>
              Documento
            </th>
            <th scope="col" className={thClass}>
              Tipo
            </th>
            <th scope="col" className={thClass}>
              Subido
            </th>
            <th scope="col" className={thClass}>
              Vence
            </th>
            <th scope="col" className={thClass}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((document) => (
            <tr key={document.id}>
              <td className="px-4 py-3">
                <div className="break-all font-medium text-slate-900">{document.originalName}</div>
                <div className="text-xs text-slate-600">{formatFileSize(document.sizeBytes)}</div>
              </td>
              <td className="px-4 py-3 text-slate-800">{document.documentType.name}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatDateTime(document.uploadedAt)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatDate(document.expiresAt)}</td>
              <td className="px-4 py-3">
                <RowActions document={document} {...actions} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocumentsCards({ items, ...actions }: { items: MyDocument[] } & ActionHandlers) {
  return (
    <ul aria-label="Mis documentos" className="space-y-3 lg:hidden">
      {items.map((document) => (
        <li key={document.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="break-all font-semibold text-slate-900">{document.originalName}</p>
          <p className="text-xs text-slate-600">{formatFileSize(document.sizeBytes)}</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <div className="col-span-2">
              <dt className="text-xs text-slate-600">Tipo</dt>
              <dd className="text-slate-900">{document.documentType.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-600">Subido</dt>
              <dd className="text-slate-900">{formatDateTime(document.uploadedAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-600">Vence</dt>
              <dd className="text-slate-900">{formatDate(document.expiresAt)}</dd>
            </div>
          </dl>
          <div className="mt-3 border-t border-slate-100 pt-2">
            <RowActions document={document} {...actions} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function MyDocumentsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [fileError, setFileError] = useState<ErrorDescription | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(searchInput.trim());
  const query = useMyDocuments({ page, limit, search: debouncedSearch || undefined });

  const hasFilters = searchInput.trim() !== '';

  const clearFilters = () => {
    setSearchInput('');
    setPage(1);
  };

  const handleDownload = async (document: MyDocument) => {
    setFileError(null);
    setBusyId(document.id);
    try {
      const blob = await fetchMyDocumentFile(document.id);
      saveBlob(blob, document.originalName);
    } catch (error) {
      toastOrReport(error, setFileError);
    } finally {
      setBusyId(null);
    }
  };

  const handleView = async (document: MyDocument) => {
    setFileError(null);
    setBusyId(document.id);
    const tab = window.open('', '_blank');
    try {
      const blob = await fetchMyDocumentFile(document.id);
      openBlobInTab(new Blob([blob], { type: document.mimeType }), tab, document.originalName);
    } catch (error) {
      tab?.close();
      toastOrReport(error, setFileError);
    } finally {
      setBusyId(null);
    }
  };

  const actions: ActionHandlers = {
    busy: busyId !== null,
    onView: (document) => void handleView(document),
    onDownload: (document) => void handleDownload(document),
  };

  const renderContent = () => {
    if (query.isPending) return <LoadingState label="Cargando tus documentos…" />;

    if (query.isError) {
      const error = describeError(query.error);
      if (error.code === NOT_LINKED_CODE) {
        return <NotLinkedNotice error={error} fetching={query.isFetching} onRetry={() => void query.refetch()} />;
      }
      return <ErrorAlert error={error} onRetry={() => void query.refetch()} />;
    }

    const { items, meta } = query.data;

    if (items.length === 0) {
      return hasFilters ? (
        <EmptyState
          title="No hay documentos que coincidan con la búsqueda."
          action={
            <button type="button" onClick={clearFilters} className={textButtonClass}>
              Quitar filtros
            </button>
          }
        />
      ) : (
        <EmptyState
          title="Todavía no tienes documentos en tu expediente."
          description="Recursos Humanos carga los documentos de tu expediente. Si falta alguno, entrégalo con ellos."
        />
      );
    }

    return (
      <div aria-busy={query.isFetching} className={`space-y-4 transition-opacity ${query.isFetching ? 'opacity-60' : ''}`}>
        <DocumentsTable items={items} {...actions} />
        <DocumentsCards items={items} {...actions} />
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
    <section aria-labelledby="my-documents-title" className="space-y-6">
      <PageHeader
        id="my-documents-title"
        title="Mis documentos"
        description="Documentos de tu expediente. Para agregar o corregir uno, entrégalo a Recursos Humanos."
        actions={
          <Link to="/inicio" className={secondaryButtonClass}>
            Volver al inicio
          </Link>
        }
      />

      <form
        role="search"
        aria-label="Buscar en mis documentos"
        onSubmit={(event: FormEvent) => event.preventDefault()}
        className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-end"
      >
        <div>
          <label htmlFor="my-doc-search" className="mb-1.5 block text-sm font-medium text-slate-700">
            Buscar
          </label>
          <input
            id="my-doc-search"
            type="search"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(1);
            }}
            placeholder="Nombre del archivo o tipo"
            className={controlClass}
          />
        </div>
        <div className="flex gap-2">
          {hasFilters && (
            <button type="button" onClick={clearFilters} className={textButtonClass}>
              Limpiar
            </button>
          )}
        </div>
      </form>

      {fileError && <ErrorAlert error={fileError} />}

      {renderContent()}
    </section>
  );
}

export default MyDocumentsPage;