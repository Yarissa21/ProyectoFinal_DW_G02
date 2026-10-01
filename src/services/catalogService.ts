import { http } from './http';
import type { ApiSuccess } from '../types/api';
import type { EmployeeCatalogs } from '../types/catalog';

export async function getEmployeeCatalogs(): Promise<EmployeeCatalogs> {
  const res = await http.get<ApiSuccess<EmployeeCatalogs>>('/employee-catalogs');
  return res.data.data;
}