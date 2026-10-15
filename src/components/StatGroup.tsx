import type { ReactNode } from 'react';

interface StatRow {
  label: string;
  value: ReactNode;
}

interface StatGroupProps {
  id: string;
  title: string;
  rows: StatRow[];
  children?: ReactNode;
}

function StatGroup({ id, title, rows, children }: StatGroupProps) {
  return (
    <section aria-labelledby={id} className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 id={id} className="flex items-center gap-2 text-base font-semibold text-slate-900">
        <span aria-hidden="true" className="h-4 w-1 rounded-full bg-blue-500" />
        {title}
      </h2>
      <dl className="mt-2 divide-y divide-slate-100 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 py-1.5">
            <dt className="text-slate-600">{row.label}</dt>
            <dd className="font-semibold text-slate-900">{row.value}</dd>
          </div>
        ))}
      </dl>
      {children}
    </section>
  );
}

export default StatGroup;