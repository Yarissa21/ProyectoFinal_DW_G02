import type { EmployeeSortField } from '../../types/employee';
import type { SortOrder } from '../../types/pagination';

interface EmployeeSortBarProps {
  sortBy?: EmployeeSortField;
  sortOrder?: SortOrder;
  onSort: (field: EmployeeSortField) => void;
}

const OPTIONS: { field: EmployeeSortField; label: string }[] = [
  { field: 'lastName', label: 'Empleado' },
  { field: 'hireDate', label: 'Ingreso' },
];

function EmployeeSortBar({ sortBy, sortOrder, onSort }: EmployeeSortBarProps) {
  return (
    <div role="group" aria-label="Ordenar empleados por" className="flex items-center gap-2 md:hidden">
      <span className="text-sm font-medium text-slate-700">Ordenar:</span>
      {OPTIONS.map((option) => {
        const active = sortBy === option.field;
        const icon = !active ? '↕' : sortOrder === 'desc' ? '▼' : '▲';
        return (
          <button
            key={option.field}
            type="button"
            aria-pressed={active}
            onClick={() => onSort(option.field)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 ${
              active
                ? 'border-blue-600 bg-blue-50 text-blue-800'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            {option.label}
            <span aria-hidden="true">{icon}</span>
          </button>
        );
      })}
    </div>
  );
}

export default EmployeeSortBar;