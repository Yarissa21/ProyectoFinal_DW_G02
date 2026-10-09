import { useIsFetching } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import ErrorAlert from '../components/ErrorAlert';
import PageHeader from '../components/PageHeader';
import StatusPanel from '../components/StatusPanel';
import HealthPanel from '../components/system/HealthPanel';
import PermissionPanel from '../components/system/PermissionPanel';
import { useEmployeeCatalogs } from '../hooks/useEmployeeCatalogs';
import { useHealthGeneral, useHealthLive, useHealthReady } from '../hooks/useHealth';
import { useAdminPermissionCheck, useHrPermissionCheck } from '../hooks/usePermissionChecks';
import { describeError } from '../services/errorMessages';
import { useAuthStore } from '../store/authStore';

const secondaryButtonClass =
  'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-60';

function SystemStatusPage() {
  const role = useAuthStore((state) => state.user?.role.code);
  const health = useHealthGeneral();
  const live = useHealthLive();
  const ready = useHealthReady();
  const adminCheck = useAdminPermissionCheck();
  const hrCheck = useHrPermissionCheck();
  const catalogs = useEmployeeCatalogs();
  const fetching = useIsFetching();

  const refreshAll = () => {
    void health.refetch();
    void live.refetch();
    void ready.refetch();
    void adminCheck.refetch();
    void hrCheck.refetch();
    void catalogs.refetch();
  };

  return (
    <section aria-labelledby="system-title" className="space-y-8">
      <PageHeader
        id="system-title"
        title="Estado del sistema"
        description={fetching > 0 ? 'Actualizando…' : ''}
        actions={
          <button type="button" onClick={refreshAll} disabled={fetching > 0} className={secondaryButtonClass}>
            Verificar de nuevo
          </button>
        }
      />

      <section aria-labelledby="health-title" className="space-y-3">
        <h2 id="health-title" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span aria-hidden="true" className="h-5 w-1 rounded-full bg-blue-500" />
          Salud del API
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <HealthPanel title="Estado general" endpoint="GET /health" query={health} />
          <HealthPanel title="Proceso activo" endpoint="GET /health/live" query={live} />
          <HealthPanel title="Listo para recibir tráfico" endpoint="GET /health/ready" query={ready} />
        </div>
      </section>

      <section aria-labelledby="permissions-title" className="space-y-3">
        <h2 id="permissions-title" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span aria-hidden="true" className="h-5 w-1 rounded-full bg-blue-500" />
          Permisos de tu sesión
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <PermissionPanel
            title="Acceso administrativo"
            endpoint="GET /auth/permissions/admin"
            expectedAllowed={role === 'ADMIN'}
            query={adminCheck}
          />
          <PermissionPanel
            title="Acceso de recursos humanos"
            endpoint="GET /auth/permissions/hr"
            expectedAllowed={role === 'ADMIN' || role === 'HR_MANAGER'}
            query={hrCheck}
          />
        </div>
      </section>

      <section aria-labelledby="catalogs-title" className="space-y-3">
        <h2 id="catalogs-title" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span aria-hidden="true" className="h-5 w-1 rounded-full bg-blue-500" />
          Catálogos
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <StatusPanel title="Departamentos y puestos" endpoint="GET /employee-catalogs">
            {catalogs.isPending && (
              <p role="status" className="text-slate-600">
                Consultando…
              </p>
            )}
            {catalogs.isError && (
              <ErrorAlert error={describeError(catalogs.error)} onRetry={() => void catalogs.refetch()} />
            )}
            {catalogs.data && (
              <>
                <dl className="space-y-1">
                  <div className="flex gap-1">
                    <dt className="font-medium">Departamentos:</dt>
                    <dd>{catalogs.data.departments.length}</dd>
                  </div>
                  <div className="flex gap-1">
                    <dt className="font-medium">Puestos:</dt>
                    <dd>{catalogs.data.positions.length}</dd>
                  </div>
                </dl>
                {catalogs.data.departments.length === 0 && catalogs.data.positions.length === 0 && (
                  <p className="mt-2 text-xs text-slate-600">
                    El API no devolvió elementos en los catálogos.
                  </p>
                )}
              </>
            )}
          </StatusPanel>
        </div>
      </section>

      <p className="text-sm text-slate-600">
        <Link
          to="/dashboard"
          className="text-blue-700 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
        >
          Volver al dashboard
        </Link>
      </p>
    </section>
  );
}

export default SystemStatusPage;