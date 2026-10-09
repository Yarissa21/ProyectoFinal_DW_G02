import { Link } from 'react-router-dom';
import { EmploymentStatusBadge, RecordStatusBadge } from '../EmployeeBadges';
import type { Employee } from '../../types/employee';
import { formatDate, fullName } from '../../utils/format';

interface EmployeeCardListProps {
  items: Employee[];
}

const linkClass =
  'rounded text-blue-800 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700';

function EmployeeCardList({ items }: EmployeeCardListProps) {
  return (
    <ul aria-label="Lista de empleados" className="space-y-3 md:hidden">
      {items.map((employee) => {
        const name = fullName(employee);
        return (
          <li key={employee.id} className="rounded-xl border border-slate-200 border-l-4 border-l-blue-500 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link to={`/empleados/${employee.id}`} className={`${linkClass} break-words font-semibold`}>
                  {name}
                </Link>
                <p className="break-all text-xs text-slate-600">{employee.email || 'Sin correo'}</p>
              </div>
              <Link to={`/empleados/${employee.id}/editar`} aria-label={`Editar a ${name}`} className={`${linkClass} text-sm`}>
                Editar
              </Link>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <EmploymentStatusBadge status={employee.status} />
              <RecordStatusBadge status={employee.recordStatus} />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <div>
                <dt className="text-xs text-slate-600">Departamento</dt>
                <dd className="text-slate-900">{employee.department.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-600">Puesto</dt>
                <dd className="text-slate-900">{employee.position.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-600">DPI</dt>
                <dd className="break-all text-slate-900">{employee.dpi}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-600">Ingreso</dt>
                <dd className="text-slate-900">{formatDate(employee.hireDate)}</dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}

export default EmployeeCardList;