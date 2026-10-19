interface ActiveBadgeProps {
  active: boolean;
  feminine?: boolean;
}

function ActiveBadge({ active, feminine = false }: ActiveBadgeProps) {
  const label = active ? (feminine ? 'Activa' : 'Activo') : feminine ? 'Inactiva' : 'Inactivo';
  const color = active ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-800';

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export default ActiveBadge;