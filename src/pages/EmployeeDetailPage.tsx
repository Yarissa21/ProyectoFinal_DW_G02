import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTimedNotice } from '../hooks/useTimedNotice';
import { EmploymentStatusBadge } from '../components/EmployeeBadges';
import AcademicRecordsSection from '../components/academic/AcademicRecordsSection';
import DocumentsSection from '../components/documents/DocumentsSection';
import BackLink from '../components/employees/BackLink';
import DetailTabs, { type DetailTab } from '../components/employees/DetailTabs';
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
type DetailSection = 'info' | 'academic' | 'documents' | 'history';

const TAB_PREFIX = 'employee-detail';
const TABS: DetailTab[] = [
  { id: 'info', label: 'Información' },
  { id: 'academic', label: 'Académicos' },
  { id: 'documents', label: 'Documentos' },
  { id: 'history', label: 'Historial' },
];

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
  const [notice, setNotice] = useTimedNotice((location.state as { notice?: string } | null)?.notice ?? null);
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const [section, setSection] = useState<DetailSection>('info');

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

  const openDialog = (next: OpenDialog) => {
    setNotice(null);
    setDialog(next);
  };

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
          <span aria-hidden="true" className="mt-3 block h-1 w-10 rounded-full bg-amber-400" />
          <h1 id="employee-title" className="mt-2 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
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
          {isAdmin && (
            <Link to={`/empleados/${employee.id}/usuario`} className={secondaryButtonClass}>
              {employee.user ? 'Cambiar usuario' : 'Vincular usuario'}
            </Link>
          )}
          <button type="button" onClick={() => openDialog('status')} className={secondaryButtonClass}>
            Cambiar estado
          </button>
          {canDelete && (
            <button type="button" onClick={() => openDialog('delete')} className={dangerButtonClass}>
              Dar de baja
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <DetailTabs
          idPrefix={TAB_PREFIX}
          label="Secciones del empleado"
          tabs={TABS}
          active={section}
          onChange={(id) => {
            setNotice(null);
            setSection(id as DetailSection);
          }}
        />
        <div role="tabpanel" id={`${TAB_PREFIX}-panel-${section}`} aria-labelledby={`${TAB_PREFIX}-tab-${section}`}>
          {section === 'info' && <EmployeeDetailCard employee={employee} />}
          {section === 'academic' && (
            <AcademicRecordsSection employeeId={employee.id} employeeName={fullName(employee)} />
          )}
          {section === 'documents' && (
            <DocumentsSection employeeId={employee.id} employeeName={fullName(employee)} />
          )}
          {section === 'history' && <EmploymentHistory employeeId={employee.id} />}
        </div>
      </div>

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