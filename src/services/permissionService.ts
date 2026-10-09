import { http } from './http';
import type { ApiSuccess } from '../types/api';
import type { AuthUser } from '../types/auth';

export async function checkAdminPermission(): Promise<AuthUser> {
  const res = await http.get<ApiSuccess<AuthUser>>('/auth/permissions/admin');
  return res.data.data;
}

export async function checkHrPermission(): Promise<AuthUser> {
  const res = await http.get<ApiSuccess<AuthUser>>('/auth/permissions/hr');
  return res.data.data;
}