import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import NotLinkedNotice, { NOT_LINKED_CODE } from '../components/selfService/NotLinkedNotice';
import { useMyAcademicRecords } from '../hooks/useSelfService';
import { describeError } from '../services/errorMessages';
import type { AcademicRecord, AcademicRecordType } from '../types/academic';
import { ACADEMIC_TYPE_LABELS, ACADEMIC_TYPE_VALUES } from '../utils/academicLabels';
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '../utils/employeeLabels';
import { formatDate } from '../utils/format';

const thClass = 'px-4 py-3 text-left text-xs font-semibold text-slate-600';
const controlClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600';
const secondaryButtonClass =
  'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600';
const textButtonClass =
  'rounded-md px-2 py-1 text-sm font-medium text-blue-800 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600';

function TypeBadge({ type }: { type: AcademicRecordType }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-slate-800">
      {ACADEMIC_TYPE_LABELS[type]}
    </span>
  );
}

function RecordsTable({ items }: { items: AcademicRecord[] }) {
  return (
    <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white lg:block">
      <table className="w-full min-w-[40rem] text-sm">
        <caption className="sr-only">Mis antecedentes académicos</caption>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecordsCards({ items }: { items: AcademicRecord[] }) {
  return (
    <ul aria-label="Mis antecedentes académicos" className="space-y-3 lg:hidden">
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
        </li>
      ))}
    </ul>
  );
}

function MyAcademicRecordsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState<AcademicRecordType | ''>('');

  const query = useMyAcademicRecords({
    page,
    limit,
    search: search || undefined,
    type: type || undefined,
  });

  const hasFilters = search !== '' || type !== '';

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
    if (query.isPending) return <LoadingState label="Cargando tus antecedentes académicos…" />;

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
          title="No hay antecedentes que coincidan con la búsqueda."
          action={
            <button type="button" onClick={clearFilters} className={textButtonClass}>
              Quitar filtros
            </button>
          }
        />
      ) : (
        <EmptyState
          title="Todavía no tienes antecedentes académicos registrados."
          description="Recursos Humanos registra los estudios en tu expediente. Si falta alguno, solicítalo con ellos."
        />
      );
    }

    return (
      <div aria-busy={query.isFetching} className={`space-y-4 transition-opacity ${query.isFetching ? 'opacity-60' : ''}`}>
        <RecordsTable items={items} />
        <RecordsCards items={items} />
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
    <section aria-labelledby="my-academic-title" className="space-y-6">
      <PageHeader
        id="my-academic-title"
        title="Mis antecedentes académicos"
        description="Títulos, certificaciones y cursos registrados en tu expediente."
        actions={
          <Link to="/inicio" className={secondaryButtonClass}>
            Volver al inicio
          </Link>
        }
      />

      <form
        role="search"
        aria-label="Buscar en mis antecedentes académicos"
        onSubmit={applySearch}
        className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_14rem_auto] sm:items-end"
      >
        <div>
          <label htmlFor="my-acad-search" className="mb-1.5 block text-sm font-medium text-slate-700">
            Buscar
          </label>
          <input
            id="my-acad-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Título, institución o código"
            className={controlClass}
          />
        </div>
        <div>
          <label htmlFor="my-acad-type" className="mb-1.5 block text-sm font-medium text-slate-700">
            Tipo
          </label>
          <select
            id="my-acad-type"
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
          <button type="submit" className={secondaryButtonClass}>
            Buscar
          </button>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className={textButtonClass}>
              Limpiar
            </button>
          )}
        </div>
      </form>

      {renderContent()}
    </section>
  );
}

export default MyAcademicRecordsPage;
