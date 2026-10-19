import { http } from './http';
import type { ApiSuccess } from '../types/api';
import type {
  Branch,
  CreateBranchPayload,
  CreateDepartmentPayload,
  CreatePositionPayload,
  Department,
  OrgListParams,
  Position,
  UpdateBranchPayload,
  UpdateDepartmentPayload,
  UpdateOrgStatusPayload,
  UpdatePositionPayload,
} from '../types/organization';
import type { Paginated } from '../types/pagination';

function cleanParams(params: OrgListParams): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    clean[key] = value as string | number | boolean;
  }
  return clean;
}

export async function listBranches(params: OrgListParams): Promise<Paginated<Branch>> {
  const res = await http.get<ApiSuccess<Paginated<Branch>>>('/branches', { params: cleanParams(params) });
  return res.data.data;
}
export async function createBranch(payload: CreateBranchPayload): Promise<Branch> {
  const res = await http.post<ApiSuccess<Branch>>('/branches', payload);
  return res.data.data;
}
export async function updateBranch(id: string, payload: UpdateBranchPayload): Promise<Branch> {
  const res = await http.patch<ApiSuccess<Branch>>(`/branches/${id}`, payload);
  return res.data.data;
}
export async function updateBranchStatus(id: string, payload: UpdateOrgStatusPayload): Promise<Branch> {
  const res = await http.patch<ApiSuccess<Branch>>(`/branches/${id}/status`, payload);
  return res.data.data;
}

export async function listDepartments(params: OrgListParams): Promise<Paginated<Department>> {
  const res = await http.get<ApiSuccess<Paginated<Department>>>('/departments', { params: cleanParams(params) });
  return res.data.data;
}
export async function createDepartment(payload: CreateDepartmentPayload): Promise<Department> {
  const res = await http.post<ApiSuccess<Department>>('/departments', payload);
  return res.data.data;
}
export async function updateDepartment(id: string, payload: UpdateDepartmentPayload): Promise<Department> {
  const res = await http.patch<ApiSuccess<Department>>(`/departments/${id}`, payload);
  return res.data.data;
}
export async function updateDepartmentStatus(id: string, payload: UpdateOrgStatusPayload): Promise<Department> {
  const res = await http.patch<ApiSuccess<Department>>(`/departments/${id}/status`, payload);
  return res.data.data;
}

export async function listPositions(params: OrgListParams): Promise<Paginated<Position>> {
  const res = await http.get<ApiSuccess<Paginated<Position>>>('/positions', { params: cleanParams(params) });
  return res.data.data;
}
export async function createPosition(payload: CreatePositionPayload): Promise<Position> {
  const res = await http.post<ApiSuccess<Position>>('/positions', payload);
  return res.data.data;
}
export async function updatePosition(id: string, payload: UpdatePositionPayload): Promise<Position> {
  const res = await http.patch<ApiSuccess<Position>>(`/positions/${id}`, payload);
  return res.data.data;
}
export async function updatePositionStatus(id: string, payload: UpdateOrgStatusPayload): Promise<Position> {
  const res = await http.patch<ApiSuccess<Position>>(`/positions/${id}/status`, payload);
  return res.data.data;
}