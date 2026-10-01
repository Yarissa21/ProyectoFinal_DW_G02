import type { PaginationMeta } from '../types/pagination';

interface PaginationProps {
  meta: PaginationMeta;
  pageSizes: readonly number[];
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  disabled?: boolean;
}

type PageItem = { type: 'page'; page: number } | { type: 'gap'; key: string };

function buildPageItems(current: number, total: number): PageItem[] {
  const pages = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const items: PageItem[] = [];
  pages.forEach((page, index) => {
    const previous = pages[index - 1];
    if (previous !== undefined && page - previous > 1) {
      items.push({ type: 'gap', key: `gap-${page}` });
    }
    items.push({ type: 'page', page });
  });
  return items;
}

const buttonClass =
  'min-h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50';

function Pagination({ meta, pageSizes, onPageChange, onLimitChange, disabled = false }: PaginationProps) {
  const from = meta.totalItems === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.totalItems);
  const items = buildPageItems(meta.page, meta.totalPages);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        Mostrando {from}–{to} de {meta.totalItems}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Por página
          <select
            value={meta.limit}
            disabled={disabled}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <nav aria-label="Paginación">
          <ul className="flex items-center gap-1">
            <li>
              <button
                type="button"
                disabled={disabled || !meta.hasPreviousPage}
                onClick={() => onPageChange(meta.page - 1)}
                className={buttonClass}
              >
                Anterior
              </button>
            </li>

            {items.map((item) =>
              item.type === 'gap' ? (
                <li key={item.key} aria-hidden="true" className="hidden px-1 text-slate-500 sm:block">
                  …
                </li>
              ) : (
                <li key={item.page} className="hidden sm:block">
                  <button
                    type="button"
                    disabled={disabled}
                    aria-current={item.page === meta.page ? 'page' : undefined}
                    aria-label={`Página ${item.page}`}
                    onClick={() => onPageChange(item.page)}
                    className={
                      item.page === meta.page
                        ? 'min-h-9 min-w-9 rounded-md bg-slate-900 px-3 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                        : `${buttonClass} min-w-9`
                    }
                  >
                    {item.page}
                  </button>
                </li>
              ),
            )}

            <li className="px-2 text-sm text-slate-600 sm:hidden">
              Página {meta.page} de {Math.max(meta.totalPages, 1)}
            </li>

            <li>
              <button
                type="button"
                disabled={disabled || !meta.hasNextPage}
                onClick={() => onPageChange(meta.page + 1)}
                className={buttonClass}
              >
                Siguiente
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Pagination;