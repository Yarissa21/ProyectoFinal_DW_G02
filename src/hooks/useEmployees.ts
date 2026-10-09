import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  getEmployeesSummary,
  listEmployees,
  listEmploymentHistory,
  updateEmployee,
  updateEmployeeStatus,
} from '../services/employeeService';
import type {
  EmployeeListParams,
  EmploymentHistoryParams,
  UpdateEmployeePayload,
  UpdateEmploymentStatusPayload,
} from '../types/employee';

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params: EmployeeListParams) => [...employeeKeys.lists(), params] as const,
  detail: (id: string) => [...employeeKeys.all, 'detail', id] as const,
  history: (id: string, params: EmploymentHistoryParams) =>
    [...employeeKeys.all, 'history', id, params] as const,
  historyOf: (id: string) => [...employeeKeys.all, 'history', id] as const,
  summary: ['reports', 'employees-summary'] as const,
};

export function useEmployees(params: EmployeeListParams) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => listEmployees(params),
    placeholderData: keepPreviousData,
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: employeeKeys.detail(id ?? ''),
    queryFn: () => getEmployee(id as string),
    enabled: !!id,
  });
}

export function useEmploymentHistory(id: string | undefined, params: EmploymentHistoryParams) {
  return useQuery({
    queryKey: employeeKeys.history(id ?? '', params),
    queryFn: () => listEmploymentHistory(id as string, params),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
}

export function useEmployeesSummary() {
  return useQuery({
    queryKey: employeeKeys.summary,
    queryFn: getEmployeesSummary,
  });
}

function useInvalidateEmployeeData() {
  const queryClient = useQueryClient();
  return (employeeId?: string) => {
    void queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: ['reports'] });
    if (employeeId) {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.historyOf(employeeId) });
    }
  };
}

export function useCreateEmployee() {
  const invalidate = useInvalidateEmployeeData();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => invalidate(),
  });
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateEmployeeData();
  return useMutation({
    mutationFn: (payload: UpdateEmployeePayload) => updateEmployee(id, payload),
    onSuccess: (employee) => {
      queryClient.setQueryData(employeeKeys.detail(id), employee);
      invalidate(id);
    },
  });
}

export function useUpdateEmployeeStatus(id: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateEmployeeData();
  return useMutation({
    mutationFn: (payload: UpdateEmploymentStatusPayload) => updateEmployeeStatus(id, payload),
    onSuccess: (employee) => {
      queryClient.setQueryData(employeeKeys.detail(id), employee);
      invalidate(id);
    },
  });
}

export function useDeleteEmployee(id: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateEmployeeData();
  return useMutation({
    mutationFn: () => deleteEmployee(id),
    onSuccess: (employee) => {
      queryClient.setQueryData(employeeKeys.detail(id), employee);
      invalidate(id);
    },
  });
}