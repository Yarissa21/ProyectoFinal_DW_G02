import { useState } from 'react';
import toast from 'react-hot-toast';
import ErrorAlert from '../ErrorAlert';
import LoadingState from '../LoadingState';
import Pagination from '../Pagination';
import DocumentDeleteDialog from './DocumentDeleteDialog';
import DocumentUploadDialog from './DocumentUploadDialog';
import { useDocumentTypes, useEmployeeDocuments } from '../../hooks/useDocuments';
import { describeError, toastOrReport, type ErrorDescription } from '../../services/errorMessages';
import { fetchEmployeeDocumentFile } from '../../services/documentService';
import type { EmployeeDocument } from '../../types/document';
import { canPreviewDocument, formatFileSize, openBlobInTab, saveBlob } from '../../utils/documentFiles';
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '../../utils/employeeLabels';
import { formatDate, formatDateTime } from '../../utils/format';

interface DocumentsSectionProps {
  employeeId: string;
  employeeName: string;
}

type OpenDialog = 'upload' | 'delete' | null;

const thClass = 'px-4 py-3 text-left text-xs font-semibold text-slate-600';
const rowButtonClass =
  'rounded-md px-2 py-1 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-50';
const controlClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600';

interface RowActionsProps {
  document: EmployeeDocument;
  busy: boolean;
  onView: (document: EmployeeDocument) => void;
  onDownload: (document: EmployeeDocument) => void;
  onDelete: (document: EmployeeDocument) => void;
}

function RowActions({ document, busy, onView, onDownload, onDelete }: RowActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {canPreviewDocument(document.mimeType) && (
        <button
          type="button"
          onClick={() => onView(document)}
          disabled={busy}
          aria-label={`Ver ${document.originalName}`}
          className={`${rowButtonClass} text-blue-800 hover:bg-blue-50`}
        >
          Ver
        </button>
      )}
      <button
        type="button"
        onClick={() => onDownload(document)}
        disabled={busy}
        aria-label={`Descargar ${document.originalName}`}
        className={`${rowButtonClass} text-blue-800 hover:bg-blue-50`}
      >
        Descargar
      </button>
      <button
        type="button"
        onClick={() => onDelete(document)}
        disabled={busy}
        aria-label={`Eliminar ${document.originalName}`}
        className={`${rowButtonClass} text-red-800 hover:bg-red-50`}
      >
        Eliminar
      </button>
    </div>
  );
}

type ActionHandlers = Omit<RowActionsProps, 'document'>;

function DocumentsTable({ items, ...actions }: { items: EmployeeDocument[] } & ActionHandlers) {
  return (
    <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white lg:block">
      <table className="w-full min-w-[44rem] text-sm">
        <caption className="sr-only">Documentos del empleado</caption>
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
              <td className="px-4 py-3 text-slate-800">
                {document.documentType.name}
                {document.documentType.isRequired && <span className="ml-1 text-xs text-slate-600">(obligatorio)</span>}
              </td>
              <td className="px-4 py-3 text-slate-700">
                <div className="whitespace-nowrap">{formatDateTime(document.uploadedAt)}</div>
                <div className="text-xs text-slate-600">{document.uploadedBy.email}</div>
              </td>
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

function DocumentsCards({ items, ...actions }: { items: EmployeeDocument[] } & ActionHandlers) {
  return (
    <ul aria-label="Documentos del empleado" className="space-y-3 lg:hidden">
      {items.map((document) => (
        <li key={document.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="break-all font-semibold text-slate-900">{document.originalName}</p>
          <p className="text-xs text-slate-600">{formatFileSize(document.sizeBytes)}</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <div className="col-span-2">
              <dt className="text-xs text-slate-600">Tipo</dt>
              <dd className="text-slate-900">
                {document.documentType.name}
                {document.documentType.isRequired && <span className="ml-1 text-xs text-slate-600">(obligatorio)</span>}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-600">Subido</dt>
              <dd className="text-slate-900">{formatDateTime(document.uploadedAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-600">Vence</dt>
              <dd className="text-slate-900">{formatDate(document.expiresAt)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-slate-600">Subido por</dt>
              <dd className="break-all text-slate-900">{document.uploadedBy.email}</dd>
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

function DocumentsSection({ employeeId, employeeName }: DocumentsSectionProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(DEFAULT_PAGE_SIZE);
  const [documentTypeId, setDocumentTypeId] = useState('');
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const [selected, setSelected] = useState<EmployeeDocument | null>(null);
  const [fileError, setFileError] = useState<ErrorDescription | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const types = useDocumentTypes();
  const query = useEmployeeDocuments(employeeId, {
    page,
    limit,
    documentTypeId: documentTypeId || undefined,
  });

  const hasFilters = documentTypeId !== '';

  const openUpload = () => {
    setDialog('upload');
  };

  const openDelete = (document: EmployeeDocument) => {
    setSelected(document);
    setDialog('delete');
  };

  const handleDownload = async (document: EmployeeDocument) => {
    setFileError(null);
    setBusyId(document.id);
    try {
      const blob = await fetchEmployeeDocumentFile(document.id);
      saveBlob(blob, document.originalName);
    } catch (error) {
      toastOrReport(error, setFileError);
    } finally {
      setBusyId(null);
    }
  };

  const handleView = async (document: EmployeeDocument) => {
    setFileError(null);
    setBusyId(document.id);
    const tab = window.open('', '_blank');
    try {
      const blob = await fetchEmployeeDocumentFile(document.id);
      const typed = new Blob([blob], { type: document.mimeType });
      openBlobInTab(typed, tab, document.originalName);
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
    onDelete: openDelete,
  };

  const renderContent = () => {
    if (query.isPending) return <LoadingState label="Cargando documentos…" />;

    if (query.isError) {
      return <ErrorAlert error={describeError(query.error)} onRetry={() => void query.refetch()} />;
    }

    const { items, meta } = query.data;

    if (items.length === 0) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600">
          {hasFilters ? (
            <>
              <p>No hay documentos de ese tipo.</p>
              <button
                type="button"
                onClick={() => {
                  setDocumentTypeId('');
                  setPage(1);
                }}
                className="mt-2 rounded-md px-2 py-1 font-medium text-blue-800 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                Quitar filtro
              </button>
            </>
          ) : (
            <>
              <p>{employeeName} todavía no tiene documentos cargados.</p>
              <button
                type="button"
                onClick={openUpload}
                className="mt-2 rounded-md px-2 py-1 font-medium text-blue-800 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                Subir el primero
              </button>
            </>
          )}
        </div>
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
          onPageChange={(value) => {
            setPage(value);
          }}
          onLimitChange={(value) => {
            setLimit(value);
            setPage(1);
          }}
        />
      </div>
    );
  };

  const currentCount = query.data?.items.length ?? 0;

  return (
    <section aria-labelledby="documents-title" className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="documents-title" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <span aria-hidden="true" className="h-5 w-1 rounded-full bg-blue-500" />
            Documentos del expediente
          </h2>
          <p className="text-sm text-slate-600">Archivos del empleado: PDF, imágenes y Word de hasta 2 MB.</p>
        </div>
        <button
          type="button"
          onClick={openUpload}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Subir documento
        </button>
      </div>

      {fileError && <ErrorAlert error={fileError} />}

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:max-w-sm">
        <label htmlFor="doc-filter-type" className="mb-1.5 block text-sm font-medium text-slate-700">
          Tipo de documento
        </label>
        <select
          id="doc-filter-type"
          value={documentTypeId}
          disabled={types.isPending}
          onChange={(event) => {
            setDocumentTypeId(event.target.value);
            setPage(1);
          }}
          className={controlClass}
        >
          <option value="">Todos</option>
          {types.data?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {renderContent()}

      <DocumentUploadDialog
        employeeId={employeeId}
        open={dialog === 'upload'}
        onClose={() => setDialog(null)}
        onUploaded={(message) => {
          setDialog(null);
          toast.success(message);
        }}
      />

      {selected && (
        <DocumentDeleteDialog
          key={`document-delete-${selected.id}`}
          employeeId={employeeId}
          document={selected}
          open={dialog === 'delete'}
          onClose={() => setDialog(null)}
          onDeleted={() => {
            setDialog(null);
            toast.success('Documento eliminado correctamente.');
            if (currentCount === 1 && page > 1) setPage(page - 1);
          }}
        />
      )}
    </section>
  );
}

export default DocumentsSection;