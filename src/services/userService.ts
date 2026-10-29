import { http } from './http';
import type { ApiSuccess } from '../types/api';
import type { Paginated } from '../types/pagination';
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  UserAccount,
  UserListParams,
} from '../types/user';

export async function listUsers(params: UserListParams): Promise<Paginated<UserAccount>> {
  const clean: Record<string, string | number | boolean> = {};
  if (params.page) clean.page = params.page;
  if (params.limit) clean.limit = params.limit;
  if (params.search) clean.search = params.search;
  if (params.sortBy) clean.sortBy = params.sortBy;
  if (params.sortOrder) clean.sortOrder = params.sortOrder;
  if (params.isActive !== undefined) clean.isActive = params.isActive === false ? '' : params.isActive;
  const res = await http.get<ApiSuccess<Paginated<UserAccount>>>('/users', { params: clean });
  return res.data.data;
}

export async function createUser(payload: CreateUserPayload): Promise<UserAccount> {
  const res = await http.post<ApiSuccess<UserAccount>>('/users', payload);
  return res.data.data;
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<UserAccount> {
  const res = await http.patch<ApiSuccess<UserAccount>>(`/users/${id}`, payload);
  return res.data.data;
}

export async function updateUserStatus(id: string, payload: UpdateUserStatusPayload): Promise<UserAccount> {
  const res = await http.patch<ApiSuccess<UserAccount>>(`/users/${id}/status`, payload);
  return res.data.data;
}