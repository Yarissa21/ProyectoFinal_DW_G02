import { http } from './http';
import type { ApiSuccess } from '../types/api';
import type { Paginated } from '../types/pagination';
import type {
  CreateEmployeePayload,
  Employee,
  EmployeeListParams,
  EmployeeSummaryReport,
  EmploymentHistoryEntry,
  EmploymentHistoryParams,
  UpdateEmployeePayload,
  UpdateEmploymentStatusPayload,
} from '../types/employee';

function cleanParams<T extends object>(params: T): Record<string, string | number> {
  const clean: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    clean[key] = value as string | number;
  }
  return clean;
}

export async function listEmployees(params: EmployeeListParams): Promise<Paginated<Employee>> {
  const res = await http.get<ApiSuccess<Paginated<Employee>>>('/employees', {
    params: cleanParams(params),
  });
  return res.data.data;
}

export async function getEmployee(id: string): Promise<Employee> {
  const res = await http.get<ApiSuccess<Employee>>(`/employees/${id}`);
  return res.data.data;
}

export async function createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
  const res = await http.post<ApiSuccess<Employee>>('/employees', payload);
  return res.data.data;
}

export async function updateEmployee(id: string, payload: UpdateEmployeePayload): Promise<Employee> {
  const res = await http.patch<ApiSuccess<Employee>>(`/employees/${id}`, payload);
  return res.data.data;
}

export async function updateEmployeeStatus(
  id: string,
  payload: UpdateEmploymentStatusPayload,
): Promise<Employee> {
  const res = await http.patch<ApiSuccess<Employee>>(`/employees/${id}/status`, payload);
  return res.data.data;
}

export async function deleteEmployee(id: string): Promise<Employee> {
  const res = await http.delete<ApiSuccess<Employee>>(`/employees/${id}`);
  return res.data.data;
}

export async function listEmploymentHistory(
  id: string,
  params: EmploymentHistoryParams,
): Promise<Paginated<EmploymentHistoryEntry>> {
  const res = await http.get<ApiSuccess<Paginated<EmploymentHistoryEntry>>>(
    `/employees/${id}/employment-history`,
    { params: cleanParams(params) },
  );
  return res.data.data;
}

export async function getEmployeesSummary(): Promise<EmployeeSummaryReport> {
  const res = await http.get<ApiSuccess<EmployeeSummaryReport>>('/reports/employees-summary');
  return res.data.data;
}