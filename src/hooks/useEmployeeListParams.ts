import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  EmployeeListParams,
  EmployeeSortField,
  EmploymentStatus,
  RecordStatus,
} from '../types/employee';
import type { SortOrder } from '../types/pagination';
import {
  DEFAULT_PAGE_SIZE,
  EMPLOYMENT_STATUS_VALUES,
  PAGE_SIZES,
  RECORD_STATUS_VALUES,
  SORT_FIELD_VALUES,
} from '../utils/employeeLabels';

export type EmployeeListState = EmployeeListParams & { page: number; limit: number };

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : fallback;
}

function parse(searchParams: URLSearchParams): EmployeeListState {
  const limit = parsePositiveInt(searchParams.get('limit'), DEFAULT_PAGE_SIZE);
  const status = searchParams.get('status') as EmploymentStatus | null;
  const recordStatus = searchParams.get('recordStatus') as RecordStatus | null;
  const sortBy = searchParams.get('sortBy') as EmployeeSortField | null;
  const sortOrder = searchParams.get('sortOrder');

  return {
    page: parsePositiveInt(searchParams.get('page'), 1),
    limit: (PAGE_SIZES as readonly number[]).includes(limit) ? limit : DEFAULT_PAGE_SIZE,
    search: searchParams.get('q')?.trim() || undefined,
    status: status && EMPLOYMENT_STATUS_VALUES.includes(status) ? status : undefined,
    recordStatus: recordStatus && RECORD_STATUS_VALUES.includes(recordStatus) ? recordStatus : undefined,
    departmentId: searchParams.get('departmentId') || undefined,
    positionId: searchParams.get('positionId') || undefined,
    sortBy: sortBy && SORT_FIELD_VALUES.includes(sortBy) ? sortBy : undefined,
    sortOrder: sortBy ? ((sortOrder === 'desc' ? 'desc' : 'asc') as SortOrder) : undefined,
  };
}

function serialize(state: EmployeeListState): URLSearchParams {
  const next = new URLSearchParams();
  if (state.page > 1) next.set('page', String(state.page));
  if (state.limit !== DEFAULT_PAGE_SIZE) next.set('limit', String(state.limit));
  if (state.search) next.set('q', state.search);
  if (state.status) next.set('status', state.status);
  if (state.recordStatus) next.set('recordStatus', state.recordStatus);
  if (state.departmentId) next.set('departmentId', state.departmentId);
  if (state.positionId) next.set('positionId', state.positionId);
  if (state.sortBy) {
    next.set('sortBy', state.sortBy);
    next.set('sortOrder', state.sortOrder ?? 'asc');
  }
  return next;
}


export function useEmployeeListParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => parse(searchParams), [searchParams]);

  const update = useCallback(
    (changes: Partial<EmployeeListState>) => {
      const isPageChange = 'page' in changes;
      setSearchParams(
        (previous) => {
          const merged = { ...parse(previous), ...changes };
          if (!isPageChange) merged.page = 1;
          return serialize(merged);
        },
        { replace: !isPageChange },
      );
    },
    [setSearchParams],
  );

  const clearFilters = useCallback(() => {
    update({
      search: undefined,
      status: undefined,
      recordStatus: undefined,
      departmentId: undefined,
      positionId: undefined,
    });
  }, [update]);

  const hasActiveFilters = Boolean(
    params.search || params.status || params.recordStatus || params.departmentId || params.positionId,
  );

  return { params, update, clearFilters, hasActiveFilters };
}