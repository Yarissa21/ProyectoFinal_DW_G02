import { useNavigate } from 'react-router-dom';
import BackLink from '../components/employees/BackLink';
import EmployeeForm from '../components/employees/EmployeeForm';
import ErrorAlert from '../components/ErrorAlert';
import LoadingState from '../components/LoadingState';
import { useEmployeeCatalogs } from '../hooks/useEmployeeCatalogs';
import { useCreateEmployee } from '../hooks/useEmployees';
import { describeError } from '../services/errorMessages';

function EmployeeCreatePage() {
  const navigate = useNavigate();
  const catalogs = useEmployeeCatalogs();
  const createEmployee = useCreateEmployee();

  if (catalogs.isPending) return <LoadingState label="Cargando catálogos…" />;

  if (catalogs.isError) {
    return (
      <div className="space-y-4">
        <BackLink to="/empleados">Volver al listado</BackLink>
        <ErrorAlert error={describeError(catalogs.error)} onRetry={() => void catalogs.refetch()} />
      </div>
    );
  }

  return (
    <section aria-labelledby="form-title" className="space-y-5">
      <div>
        <BackLink to="/empleados">Volver al listado</BackLink>
        <h1 id="form-title" className="mt-2 text-2xl font-bold text-slate-900">
          Nuevo empleado
        </h1>
      </div>

      <EmployeeForm
        mode="create"
        catalogs={catalogs.data}
        cancelTo="/empleados"
        onSubmit={async (payload) => {
          const employee = await createEmployee.mutateAsync(payload);
          navigate(`/empleados/${employee.id}`, { state: { notice: 'Empleado registrado correctamente.' } });
        }}
      />
    </section>
  );
}

export default EmployeeCreatePage;