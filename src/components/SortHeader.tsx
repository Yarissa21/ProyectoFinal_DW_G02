import type { SortOrder } from '../types/pagination';

interface SortControlProps {
  label: string;
  active: boolean;
  order?: SortOrder;
  onClick: () => void;
}

const thClass = 'px-4 py-3 text-left text-xs font-semibold text-slate-600';

function sortIcon(active: boolean, order?: SortOrder) {
  if (!active) return '↕';
  return order === 'desc' ? '▼' : '▲';
}

export function SortHeader({ label, active, order, onClick }: SortControlProps) {
  const ariaSort = active ? (order === 'desc' ? 'descending' : 'ascending') : 'none';

  return (
    <th scope="col" aria-sort={ariaSort} className={thClass}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 rounded font-semibold hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
      >
        {label}
        <span aria-hidden="true" className={active ? 'text-slate-900' : 'text-slate-400'}>
          {sortIcon(active, order)}
        </span>
      </button>
    </th>
  );
}

export function SortButton({ label, active, order, onClick }: SortControlProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 ${
        active ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
      }`}
    >
      {label}
      <span aria-hidden="true">{sortIcon(active, order)}</span>
    </button>
  );
}