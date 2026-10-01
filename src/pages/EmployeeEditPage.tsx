import { useNavigate, useParams } from 'react-router-dom';
import BackLink from '../components/employees/BackLink';
import EmployeeForm from '../components/employees/EmployeeForm';
import ErrorAlert from '../components/ErrorAlert';
import LoadingState from '../components/LoadingState';
import { useEmployeeCatalogs } from '../hooks/useEmployeeCatalogs';
import { useEmployee, useUpdateEmployee } from '../hooks/useEmployees';
import { describeError } from '../services/errorMessages';
import { fullName } from '../utils/format';

function EmployeeEditPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const employeeQuery = useEmployee(id);
  const catalogs = useEmployeeCatalogs();
  const updateEmployee = useUpdateEmployee(id);

  if (employeeQuery.isPending || catalogs.isPending) return <LoadingState label="Cargando datos del empleado…" />;

  if (employeeQuery.isError) {
    return (
      <div className="space-y-4">
        <BackLink to="/empleados">Volver al listado</BackLink>
        <ErrorAlert error={describeError(employeeQuery.error)} onRetry={() => void employeeQuery.refetch()} />
      </div>
    );
  }

  if (catalogs.isError) {
    return (
      <div className="space-y-4">
        <BackLink to={`/empleados/${id}`}>Volver al detalle</BackLink>
        <ErrorAlert error={describeError(catalogs.error)} onRetry={() => void catalogs.refetch()} />
      </div>
    );
  }

  const employee = employeeQuery.data;

  return (
    <section aria-labelledby="form-title" className="space-y-5">
      <div>
        <BackLink to={`/empleados/${id}`}>Volver al detalle</BackLink>
        <h1 id="form-title" className="mt-2 break-words text-2xl font-bold text-slate-900">
          Editar a {fullName(employee)}
        </h1>
      </div>

      <EmployeeForm
        mode="edit"
        employee={employee}
        catalogs={catalogs.data}
        cancelTo={`/empleados/${id}`}
        onSubmit={async (payload) => {
          await updateEmployee.mutateAsync(payload);
          navigate(`/empleados/${id}`, { state: { notice: 'Cambios guardados correctamente.' } });
        }}
      />
    </section>
  );
}

export default EmployeeEditPage;