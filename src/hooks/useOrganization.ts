import { keepPreviousData, useMutation, useQuery, useQueryClient, useQueries } from '@tanstack/react-query';
import {
  createBranch,
  createDepartment,
  createPosition,
  listBranches,
  listDepartments,
  listPositions,
  updateBranch,
  updateBranchStatus,
  updateDepartment,
  updateDepartmentStatus,
  updatePosition,
  updatePositionStatus,
} from '../services/organizationService';
import type {
  CreateBranchPayload,
  CreateDepartmentPayload,
  CreatePositionPayload,
  OrgListParams,
  UpdateBranchPayload,
  UpdateDepartmentPayload,
  UpdateOrgStatusPayload,
  UpdatePositionPayload,
  getDepartment,
} from '../types/organization';
import { catalogKeys } from './useEmployeeCatalogs';

export const orgKeys = {
  all: ['organization'] as const,
  branches: (params: OrgListParams) => [...orgKeys.all, 'branches', params] as const,
  departments: (params: OrgListParams) => [...orgKeys.all, 'departments', params] as const,
  positions: (params: OrgListParams) => [...orgKeys.all, 'positions', params] as const,
};

export function useBranches(params: OrgListParams) {
  return useQuery({
    queryKey: orgKeys.branches(params),
    queryFn: () => listBranches(params),
    placeholderData: keepPreviousData,
  });
}

export function useDepartments(params: OrgListParams) {
  return useQuery({
    queryKey: orgKeys.departments(params),
    queryFn: () => listDepartments(params),
    placeholderData: keepPreviousData,
  });
}

export function useDepartmentsById(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: [...orgKeys.all, 'department', id] as const,
      queryFn: () => getDepartment(id),
    })),
  });
}

export function usePositions(params: OrgListParams) {
  return useQuery({
    queryKey: orgKeys.positions(params),
    queryFn: () => listPositions(params),
    placeholderData: keepPreviousData,
  });
}

function useRefreshOrganization() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: orgKeys.all });
    void queryClient.invalidateQueries({ queryKey: catalogKeys.employees });
    void queryClient.invalidateQueries({ queryKey: ['reports'] });
  };
}

export function useCreateBranch() {
  const refresh = useRefreshOrganization();
  return useMutation({ mutationFn: (payload: CreateBranchPayload) => createBranch(payload), onSuccess: refresh });
}
export function useUpdateBranch(id: string) {
  const refresh = useRefreshOrganization();
  return useMutation({ mutationFn: (payload: UpdateBranchPayload) => updateBranch(id, payload), onSuccess: refresh });
}
export function useUpdateBranchStatus(id: string) {
  const refresh = useRefreshOrganization();
  return useMutation({
    mutationFn: (payload: UpdateOrgStatusPayload) => updateBranchStatus(id, payload),
    onSuccess: refresh,
  });
}

export function useCreateDepartment() {
  const refresh = useRefreshOrganization();
  return useMutation({
    mutationFn: (payload: CreateDepartmentPayload) => createDepartment(payload),
    onSuccess: refresh,
  });
}
export function useUpdateDepartment(id: string) {
  const refresh = useRefreshOrganization();
  return useMutation({
    mutationFn: (payload: UpdateDepartmentPayload) => updateDepartment(id, payload),
    onSuccess: refresh,
  });
}
export function useUpdateDepartmentStatus(id: string) {
  const refresh = useRefreshOrganization();
  return useMutation({
    mutationFn: (payload: UpdateOrgStatusPayload) => updateDepartmentStatus(id, payload),
    onSuccess: refresh,
  });
}

export function useCreatePosition() {
  const refresh = useRefreshOrganization();
  return useMutation({ mutationFn: (payload: CreatePositionPayload) => createPosition(payload), onSuccess: refresh });
}
export function useUpdatePosition(id: string) {
  const refresh = useRefreshOrganization();
  return useMutation({
    mutationFn: (payload: UpdatePositionPayload) => updatePosition(id, payload),
    onSuccess: refresh,
  });
}
export function useUpdatePositionStatus(id: string) {
  const refresh = useRefreshOrganization();
  return useMutation({
    mutationFn: (payload: UpdateOrgStatusPayload) => updatePositionStatus(id, payload),
    onSuccess: refresh,
  });
}