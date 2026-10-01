import { Link } from 'react-router-dom';
import { EmploymentStatusBadge, RecordStatusBadge } from '../EmployeeBadges';
import type { Employee, EmployeeSortField } from '../../types/employee';
import type { SortOrder } from '../../types/pagination';
import { formatDate, fullName } from '../../utils/format';

interface EmployeeTableProps {
  items: Employee[];
  sortBy?: EmployeeSortField;
  sortOrder?: SortOrder;
  onSort: (field: EmployeeSortField) => void;
}

interface SortHeaderProps {
  field: EmployeeSortField;
  label: string;
  sortBy?: EmployeeSortField;
  sortOrder?: SortOrder;
  onSort: (field: EmployeeSortField) => void;
}

const thClass = 'px-4 py-3 text-left text-xs font-semibold text-slate-600';
const linkClass =
  'rounded text-blue-800 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700';

function SortHeader({ field, label, sortBy, sortOrder, onSort }: SortHeaderProps) {
  const active = sortBy === field;
  const ariaSort = active ? (sortOrder === 'desc' ? 'descending' : 'ascending') : 'none';
  const icon = !active ? '↕' : sortOrder === 'desc' ? '▼' : '▲';

  return (
    <th scope="col" aria-sort={ariaSort} className={thClass}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1.5 rounded font-semibold hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
      >
        {label}
        <span aria-hidden="true" className={active ? 'text-slate-900' : 'text-slate-400'}>
          {icon}
        </span>
      </button>
    </th>
  );
}

function EmployeeTable({ items, sortBy, sortOrder, onSort }: EmployeeTableProps) {
  return (
    <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
      <table className="w-full min-w-[56rem] text-sm">
        <caption className="sr-only">Lista de empleados</caption>
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <SortHeader field="lastName" label="Empleado" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
            <th scope="col" className={thClass}>
              DPI
            </th>
            <th scope="col" className={thClass}>
              Departamento y puesto
            </th>
            <th scope="col" className={thClass}>
              Estado laboral
            </th>
            <th scope="col" className={thClass}>
              Expediente
            </th>
            <SortHeader field="hireDate" label="Ingreso" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
            <th scope="col" className={`${thClass} text-right`}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((employee) => {
            const name = fullName(employee);
            return (
              <tr key={employee.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/empleados/${employee.id}`} className={`${linkClass} font-medium`}>
                    {name}
                  </Link>
                  <div className="text-xs text-slate-600">{employee.email || 'Sin correo'}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{employee.dpi}</td>
                <td className="px-4 py-3 text-slate-900">
                  {employee.department.name}
                  <div className="text-xs text-slate-600">{employee.position.name}</div>
                </td>
                <td className="px-4 py-3">
                  <EmploymentStatusBadge status={employee.status} />
                </td>
                <td className="px-4 py-3">
                  <RecordStatusBadge status={employee.recordStatus} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatDate(employee.hireDate)}</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/empleados/${employee.id}/editar`} aria-label={`Editar a ${name}`} className={linkClass}>
                    Editar
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeTable;