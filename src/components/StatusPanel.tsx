import type { ReactNode } from 'react';

interface StatusPanelProps {
  title: string;
  endpoint: string;
  children: ReactNode;
}

function StatusPanel({ title, endpoint, children }: StatusPanelProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-0.5 break-all text-xs text-slate-500">{endpoint}</p>
      <div className="mt-3 text-sm">{children}</div>
    </article>
  );
}

export default StatusPanel;