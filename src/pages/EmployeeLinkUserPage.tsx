import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BackLink from '../components/employees/BackLink';
import ServerIssueAlert from '../components/employees/ServerIssueAlert';
import UserSelectField from '../components/employees/UserSelectField';
import ErrorAlert from '../components/ErrorAlert';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { useEmployee, useUpdateEmployee } from '../hooks/useEmployees';
import { describeError } from '../services/errorMessages';
import type { Employee } from '../types/employee';
import { fullName } from '../utils/format';
import type { ServerIssue } from '../utils/formErrors';

function LinkUserForm({ employee }: { employee: Employee }) {
  const navigate = useNavigate();
  const updateEmployee = useUpdateEmployee(employee.id);
  const [userId, setUserId] = useState(employee.user?.id ?? '');
  const [issue, setIssue] = useState<ServerIssue | null>(null);

  const unchanged = userId === '' || userId === employee.user?.id;

  const save = async () => {
    setIssue(null);
    try {
      await updateEmployee.mutateAsync({ userId });
      navigate(`/empleados/${employee.id}`, { state: { notice: 'Usuario vinculado correctamente.' } });
    } catch (error) {
      setIssue({ error: describeError(error), extra: [] });
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
      noValidate
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
    >
      <p className="text-sm text-slate-700">
        Usuario actual: <span className="font-semibold">{employee.user?.email ?? 'Sin cuenta vinculada'}</span>
      </p>

      <UserSelectField
        id="link-userId"
        label="Usuario a vincular"
        hint="Se muestran las cuentas activas con rol de empleado."
        value={userId}
        onChange={setUserId}
        current={employee.user}
        getDefaults={() => ({
          email: employee.email ?? '',
          firstName: employee.firstName,
          lastName: employee.lastName,
        })}
      />

      {issue && <ServerIssueAlert issue={issue} onRetry={() => void save()} />}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          to={`/empleados/${employee.id}`}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={unchanged || updateEmployee.isPending}
          aria-busy={updateEmployee.isPending}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
        >
          {updateEmployee.isPending ? 'Guardando…' : 'Vincular usuario'}
        </button>
      </div>
    </form>
  );
}

function EmployeeLinkUserPage() {
  const { id = '' } = useParams<{ id: string }>();
  const query = useEmployee(id);

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

  return (
    <section aria-labelledby="link-title" className="space-y-5">
      <BackLink to={`/empleados/${id}`}>Volver al detalle</BackLink>
      <PageHeader
        id="link-title"
        title="Vincular usuario"
        description={`Empleado: ${fullName(employee)}`}
      />
      <LinkUserForm employee={employee} />
    </section>
  );
}

export default EmployeeLinkUserPage;