import { http } from './http';
import type { ApiSuccess } from '../types/api';
import type { Paginated } from '../types/pagination';
import type { CreateUserPayload, UserAccount, UserListParams } from '../types/user';

export async function listUsers(params: UserListParams): Promise<Paginated<UserAccount>> {
  const clean: Record<string, string | number | boolean> = {};
  if (params.page) clean.page = params.page;
  if (params.limit) clean.limit = params.limit;
  if (params.search) clean.search = params.search;
  if (params.isActive !== undefined) clean.isActive = params.isActive;
  const res = await http.get<ApiSuccess<Paginated<UserAccount>>>('/users', { params: clean });
  return res.data.data;
}

export async function createUser(payload: CreateUserPayload): Promise<UserAccount> {
  const res = await http.post<ApiSuccess<UserAccount>>('/users', payload);
  return res.data.data;
}