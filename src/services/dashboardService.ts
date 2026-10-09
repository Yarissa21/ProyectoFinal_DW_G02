import { http } from './http';
import type { ApiSuccess } from '../types/api';
import type { DashboardReport } from '../types/dashboard';

export async function getDashboard(): Promise<DashboardReport> {
  const res = await http.get<ApiSuccess<DashboardReport>>('/reports/dashboard');
  return res.data.data;
}