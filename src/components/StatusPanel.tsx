import type { ReactNode } from 'react';

interface StatusPanelProps {
  title: string;
  children: ReactNode;
}

function StatusPanel({ title, children }: StatusPanelProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 text-sm">{children}</div>
    </article>
  );
}

export default StatusPanel;