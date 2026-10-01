import { Link } from 'react-router-dom';
import EmployeeCardList from '../components/employees/EmployeeCardList';
import EmployeeFilters from '../components/employees/EmployeeFilters';
import EmployeeTable from '../components/employees/EmployeeTable';
import ErrorAlert from '../components/ErrorAlert';
import Pagination from '../components/Pagination';
import { useEmployeeCatalogs } from '../hooks/useEmployeeCatalogs';
import { useEmployeeListParams } from '../hooks/useEmployeeListParams';
import { useEmployees } from '../hooks/useEmployees';
import { describeError } from '../services/errorMessages';
import type { EmployeeSortField } from '../types/employee';
import { PAGE_SIZES } from '../utils/employeeLabels';
import LoadingState from '../components/LoadingState';

const primaryButtonClass =
  'rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';
const secondaryButtonClass =
  'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600';

function EmployeesPage() {
  const { params, update, clearFilters, hasActiveFilters } = useEmployeeListParams();
  const catalogs = useEmployeeCatalogs();
  const query = useEmployees(params);

  const handleSort = (field: EmployeeSortField) => {
    if (params.sortBy === field) {
      update({ sortOrder: params.sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      update({ sortBy: field, sortOrder: 'asc' });
    }
  };

  const data = query.data;
  const totalItems = data?.meta.totalItems ?? 0;

  let statusText = '';
  if (query.isFetching && !query.isPending) statusText = 'Actualizando…';
  else if (data) statusText = totalItems === 1 ? '1 empleado encontrado' : `${totalItems} empleados encontrados`;

  const renderContent = () => {
    if (query.isPending) {
      return <LoadingState label="Cargando empleados…" />;
    }

    if (query.isError) {
      return (
        <div className="space-y-3">
          <ErrorAlert error={describeError(query.error)} onRetry={() => void query.refetch()} />
          {(params.sortBy || hasActiveFilters) && (
            <div className="flex flex-wrap gap-2">
              {params.sortBy && (
                <button
                  type="button"
                  onClick={() => update({ sortBy: undefined, sortOrder: undefined })}
                  className={secondaryButtonClass}
                >
                  Quitar el orden
                </button>
              )}
              {hasActiveFilters && (
                <button type="button" onClick={clearFilters} className={secondaryButtonClass}>
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      );
    }

    if (!data) return null;

    if (data.items.length === 0) {
      if (data.meta.totalItems > 0) {
        return (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center">
            <p className="font-semibold text-slate-900">Esta página ya no tiene resultados.</p>
            <button
              type="button"
              onClick={() => update({ page: data.meta.totalPages })}
              className={`${secondaryButtonClass} mt-4`}
            >
              Ir a la última página
            </button>
          </div>
        );
      }

      return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center">
          {hasActiveFilters ? (
            <>
              <p className="font-semibold text-slate-900">Ningún empleado coincide con la búsqueda.</p>
              <p className="mt-1 text-sm text-slate-600">Prueba con otros términos o quita algún filtro.</p>
              <button type="button" onClick={clearFilters} className={`${secondaryButtonClass} mt-4`}>
                Limpiar filtros
              </button>
            </>
          ) : (
            <>
              <p className="font-semibold text-slate-900">Todavía no hay empleados registrados.</p>
              <p className="mt-1 text-sm text-slate-600">Registra el primero para empezar.</p>
              <Link to="/empleados/nuevo" className={`${primaryButtonClass} mt-4 inline-block`}>
                Nuevo empleado
              </Link>
            </>
          )}
        </div>
      );
    }

    return (
      <div aria-busy={query.isFetching} className={`space-y-4 transition-opacity ${query.isFetching ? 'opacity-60' : ''}`}>
        <EmployeeTable items={data.items} sortBy={params.sortBy} sortOrder={params.sortOrder} onSort={handleSort} />
        <EmployeeCardList items={data.items} />
        <Pagination
          meta={data.meta}
          pageSizes={PAGE_SIZES}
          disabled={query.isFetching}
          onPageChange={(page) => update({ page })}
          onLimitChange={(limit) => update({ limit })}
        />
      </div>
    );
  };

  return (
    <section aria-labelledby="employees-title" className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 id="employees-title" className="text-2xl font-bold text-slate-900">
            Empleados
          </h1>
          <p aria-live="polite" className="mt-1 min-h-5 text-sm text-slate-600">
            {statusText}
          </p>
        </div>
        <Link to="/empleados/nuevo" className={primaryButtonClass}>
          Nuevo empleado
        </Link>
      </div>

      <EmployeeFilters
        params={params}
        catalogs={catalogs}
        hasActiveFilters={hasActiveFilters}
        onChange={update}
        onClear={clearFilters}
      />

      {renderContent()}
    </section>
  );
}

export default EmployeesPage;