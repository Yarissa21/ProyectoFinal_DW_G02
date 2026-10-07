import { useState, type FormEvent } from 'react';
import ErrorAlert from '../ErrorAlert';
import LoadingState from '../LoadingState';
import Pagination from '../Pagination';
import AcademicDeleteDialog from './AcademicDeleteDialog';
import AcademicRecordDialog from './AcademicRecordDialog';
import { useAcademicRecords } from '../../hooks/useAcademicRecords';
import { describeError } from '../../services/errorMessages';
import type { AcademicRecord, AcademicRecordType } from '../../types/academic';
import { ACADEMIC_TYPE_LABELS, ACADEMIC_TYPE_VALUES } from '../../utils/academicLabels';
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '../../utils/employeeLabels';
import { formatDate } from '../../utils/format';

interface AcademicRecordsSectionProps {
  employeeId: string;
  employeeName: string;
}

type OpenDialog = 'create' | 'edit' | 'delete' | null;

const thClass = 'px-4 py-3 text-left text-xs font-semibold text-slate-600';
const rowButtonClass =
  'rounded-md px-2 py-1 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600';
const controlClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600';

function TypeBadge({ type }: { type: AcademicRecordType }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-slate-800">
      {ACADEMIC_TYPE_LABELS[type]}
    </span>
  );
}

interface RowActionsProps {
  record: AcademicRecord;
  onEdit: (record: AcademicRecord) => void;
  onDelete: (record: AcademicRecord) => void;
}

function RowActions({ record, onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onEdit(record)}
        aria-label={`Editar ${record.title}`}
        className={`${rowButtonClass} text-blue-800 hover:bg-blue-50`}
      >
        Editar
      </button>
      <button
        type="button"
        onClick={() => onDelete(record)}
        aria-label={`Eliminar ${record.title}`}
        className={`${rowButtonClass} text-red-800 hover:bg-red-50`}
      >
        Eliminar
      </button>
    </div>
  );
}

function AcademicTable({ items, onEdit, onDelete }: { items: AcademicRecord[] } & Omit<RowActionsProps, 'record'>) {
  return (
    <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white lg:block">
      <table className="w-full min-w-[44rem] text-sm">
        <caption className="sr-only">Antecedentes académicos</caption>
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th scope="col" className={thClass}>
              Estudio
            </th>
            <th scope="col" className={thClass}>
              Institución
            </th>
            <th scope="col" className={thClass}>
              Graduación
            </th>
            <th scope="col" className={thClass}>
              Credencial
            </th>
            <th scope="col" className={thClass}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((record) => (
            <tr key={record.id}>
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900">{record.title}</div>
                <div className="mt-1">
                  <TypeBadge type={record.type} />
                </div>
                {record.notes && <p className="mt-1 max-w-xs text-xs text-slate-600">{record.notes}</p>}
              </td>
              <td className="px-4 py-3 text-slate-800">{record.institution}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatDate(record.graduationDate)}</td>
              <td className="px-4 py-3 text-slate-700">{record.credentialCode || '—'}</td>
              <td className="px-4 py-3">
                <RowActions record={record} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AcademicCards({ items, onEdit, onDelete }: { items: AcademicRecord[] } & Omit<RowActionsProps, 'record'>) {
  return (
    <ul aria-label="Antecedentes académicos" className="space-y-3 lg:hidden">
      {items.map((record) => (
        <li key={record.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <span className="min-w-0 break-words font-semibold text-slate-900">{record.title}</span>
            <TypeBadge type={record.type} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <div className="col-span-2">
              <dt className="text-xs text-slate-600">Institución</dt>
              <dd className="text-slate-900">{record.institution}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-600">Graduación</dt>
              <dd className="text-slate-900">{formatDate(record.graduationDate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-600">Credencial</dt>
              <dd className="break-all text-slate-900">{record.credentialCode || '—'}</dd>
            </div>
            {record.notes && (
              <div className="col-span-2">
                <dt className="text-xs text-slate-600">Notas</dt>
                <dd className="text-slate-900">{record.notes}</dd>
              </div>
            )}
          </dl>
          <div className="mt-3 border-t border-slate-100 pt-2">
            <RowActions record={record} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function AcademicRecordsSection({ employeeId, employeeName }: AcademicRecordsSectionProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState<AcademicRecordType | ''>('');
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const [selected, setSelected] = useState<AcademicRecord | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const query = useAcademicRecords(employeeId, {
    page,
    limit,
    search: search || undefined,
    type: type || undefined,
  });

  const hasFilters = search !== '' || type !== '';

  const closeDialog = () => setDialog(null);

  const openCreate = () => {
    setNotice(null);
    setSelected(null);
    setDialog('create');
  };
  const openEdit = (record: AcademicRecord) => {
    setNotice(null);
    setSelected(record);
    setDialog('edit');
  };
  const openDelete = (record: AcademicRecord) => {
    setNotice(null);
    setSelected(record);
    setDialog('delete');
  };

  const applySearch = (event: FormEvent) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setType('');
    setPage(1);
  };

  const renderContent = () => {
    if (query.isPending) return <LoadingState label="Cargando antecedentes académicos…" />;

    if (query.isError) {
      return <ErrorAlert error={describeError(query.error)} onRetry={() => void query.refetch()} />;
    }

    const { items, meta } = query.data;

    if (items.length === 0) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600">
          {hasFilters ? (
            <>
              <p>No hay antecedentes que coincidan con la búsqueda.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 rounded-md px-2 py-1 font-medium text-blue-800 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                Quitar filtros
              </button>
            </>
          ) : (
            <>
              <p>{employeeName} todavía no tiene antecedentes académicos registrados.</p>
              <button
                type="button"
                onClick={openCreate}
                className="mt-2 rounded-md px-2 py-1 font-medium text-blue-800 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                Agregar el primero
              </button>
            </>
          )}
        </div>
      );
    }

    return (
      <div aria-busy={query.isFetching} className={`space-y-4 transition-opacity ${query.isFetching ? 'opacity-60' : ''}`}>
        <AcademicTable items={items} onEdit={openEdit} onDelete={openDelete} />
        <AcademicCards items={items} onEdit={openEdit} onDelete={openDelete} />
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

  const currentItems = query.data?.items ?? [];

  return (
    <section aria-labelledby="academic-title" className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="academic-title" className="text-lg font-semibold text-slate-900">
            Antecedentes académicos
          </h2>
          <p className="text-sm text-slate-600">Títulos, certificaciones y cursos del empleado.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Agregar antecedente
        </button>
      </div>

      {notice && (
        <p role="status" className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900">
          {notice}
        </p>
      )}

      <form
        role="search"
        aria-label="Buscar antecedentes académicos"
        onSubmit={applySearch}
        className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_14rem_auto] sm:items-end"
      >
        <div>
          <label htmlFor="acad-search" className="mb-1.5 block text-sm font-medium text-slate-700">
            Buscar
          </label>
          <input
            id="acad-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Título, institución o código"
            className={controlClass}
          />
        </div>
        <div>
          <label htmlFor="acad-filter-type" className="mb-1.5 block text-sm font-medium text-slate-700">
            Tipo
          </label>
          <select
            id="acad-filter-type"
            value={type}
            onChange={(event) => {
              setType(event.target.value as AcademicRecordType | '');
              setPage(1);
            }}
            className={controlClass}
          >
            <option value="">Todos</option>
            {ACADEMIC_TYPE_VALUES.map((value) => (
              <option key={value} value={value}>
                {ACADEMIC_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            Buscar
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 underline hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              Limpiar
            </button>
          )}
        </div>
      </form>

      {renderContent()}

      <AcademicRecordDialog
        key={dialog === 'edit' ? selected?.id : 'create'}
        employeeId={employeeId}
        record={dialog === 'edit' ? selected : null}
        open={dialog === 'create' || dialog === 'edit'}
        onClose={closeDialog}
        onSaved={(message) => {
          setDialog(null);
          setNotice(message);
        }}
      />

      {selected && (
        <AcademicDeleteDialog
          key={selected.id}
          employeeId={employeeId}
          record={selected}
          open={dialog === 'delete'}
          onClose={closeDialog}
          onDeleted={() => {
            setDialog(null);
            setNotice('Antecedente académico eliminado correctamente.');
            if (currentItems.length === 1 && page > 1) setPage(page - 1);
          }}
        />
      )}
    </section>
  );
}

export default AcademicRecordsSection;
