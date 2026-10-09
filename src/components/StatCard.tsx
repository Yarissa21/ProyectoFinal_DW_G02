import type { ReactNode } from 'react';

type StatTone = 'brand' | 'success' | 'warning' | 'danger' | 'info';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: StatTone;
}

const TONES: Record<StatTone, { box: string; value: string; bar: string }> = {
  brand: { box: 'border-blue-200 bg-blue-50', value: 'text-blue-800', bar: 'bg-blue-500' },
  success: { box: 'border-emerald-200 bg-emerald-50', value: 'text-emerald-800', bar: 'bg-emerald-500' },
  warning: { box: 'border-amber-200 bg-amber-50', value: 'text-amber-800', bar: 'bg-amber-500' },
  danger: { box: 'border-rose-200 bg-rose-50', value: 'text-rose-800', bar: 'bg-rose-500' },
  info: { box: 'border-violet-200 bg-violet-50', value: 'text-violet-800', bar: 'bg-violet-500' },
};

function StatCard({ label, value, hint, tone = 'brand' }: StatCardProps) {
  const style = TONES[tone];

  return (
    <div className={`relative overflow-hidden rounded-xl border p-4 pl-5 ${style.box}`}>
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${style.bar}`} />
      <dt className="text-sm font-medium text-slate-700">{label}</dt>
      <dd className={`mt-1 text-3xl font-bold ${style.value}`}>{value}</dd>
      {hint && <p className="mt-1 text-xs text-slate-600">{hint}</p>}
    </div>
  );
}

export default StatCard;