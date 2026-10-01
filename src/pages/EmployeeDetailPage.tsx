import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { EmploymentStatusBadge } from '../components/EmployeeBadges';
import BackLink from '../components/employees/BackLink';
import EmployeeDeleteDialog from '../components/employees/EmployeeDeleteDialog';
import EmployeeDetailCard from '../components/employees/EmployeeDetailCard';
import EmployeeStatusDialog from '../components/employees/EmployeeStatusDialog';
import EmploymentHistory from '../components/employees/EmploymentHistory';
import ErrorAlert from '../components/ErrorAlert';
import LoadingState from '../components/LoadingState';
import { useEmployee } from '../hooks/useEmployees';
import { describeError } from '../services/errorMessages';
import { useAuthStore } from '../store/authStore';
import { fullName } from '../utils/format';

type OpenDialog = 'status' | 'delete' | null;

const primaryButtonClass =
  'rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';
const secondaryButtonClass =
  'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600';
const dangerButtonClass =
  'rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-700';

function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role.code);
  const query = useEmployee(id);
  const [notice, setNotice] = useState<string | undefined>(
    () => (location.state as { notice?: string } | null)?.notice,
  );
  const [dialog, setDialog] = useState<OpenDialog>(null);

  useEffect(() => {
    if ((location.state as { notice?: string } | null)?.notice) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  if (query.isPending) return <LoadingState label="Cargando empleado…" />;

  if (query.isError) {
    return (
      <div className="space-y-4">
        <BackLink to="/empleados">Volver al listado</BackLink>
        <ErrorAlert error={describeError(query.error)} onRetry={() => void query.refetch()} />
      </div>
    );
  }

  const employee = query.data;
  const isAdmin = role === 'ADMIN';
  const canDelete = isAdmin && employee.status !== 'RETIRED';

  return (
    <section aria-labelledby="employee-title" className="space-y-6">
      {notice && (
        <p role="status" className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900">
          {notice}
        </p>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <BackLink to="/empleados">Volver al listado</BackLink>
          <h1 id="employee-title" className="mt-2 break-words text-2xl font-bold text-slate-900">
            {fullName(employee)}
          </h1>
          <div className="mt-2">
            <EmploymentStatusBadge status={employee.status} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={`/empleados/${employee.id}/editar`} className={primaryButtonClass}>
            Editar
          </Link>
          <button type="button" onClick={() => setDialog('status')} className={secondaryButtonClass}>
            Cambiar estado
          </button>
          {canDelete && (
            <button type="button" onClick={() => setDialog('delete')} className={dangerButtonClass}>
              Dar de baja
            </button>
          )}
        </div>
      </div>

      <EmployeeDetailCard employee={employee} />

      <EmploymentHistory employeeId={employee.id} />

      <EmployeeStatusDialog
        employee={employee}
        open={dialog === 'status'}
        onClose={() => setDialog(null)}
        onSaved={() => {
          setDialog(null);
          setNotice('Estado laboral actualizado correctamente.');
        }}
      />

      {isAdmin && (
        <EmployeeDeleteDialog
          employee={employee}
          open={dialog === 'delete'}
          onClose={() => setDialog(null)}
          onDeleted={() => {
            setDialog(null);
            setNotice('Empleado dado de baja correctamente.');
          }}
        />
      )}
    </section>
  );
}

export default EmployeeDetailPage;