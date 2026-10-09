import type { ReactNode } from 'react';

interface PageHeaderProps {
  id: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

function PageHeader({ id, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <span aria-hidden="true" className="mb-2 block h-1 w-10 rounded-full bg-amber-400" />
        <h1 id={id} className="break-words text-2xl font-bold text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {description !== undefined && (
          <p aria-live="polite" className="mt-1 min-h-5 text-sm text-slate-600">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export default PageHeader;