import { http } from './http';
import type { ApiSuccess } from '../types/api';
import type { Paginated } from '../types/pagination';
import type {
  AcademicRecord,
  AcademicRecordListParams,
  CreateAcademicRecordPayload,
  UpdateAcademicRecordPayload,
} from '../types/academic';

function cleanParams<T extends object>(params: T): Record<string, string | number> {
  const clean: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    clean[key] = value as string | number;
  }
  return clean;
}

export async function listAcademicRecords(
  employeeId: string,
  params: AcademicRecordListParams,
): Promise<Paginated<AcademicRecord>> {
  const res = await http.get<ApiSuccess<Paginated<AcademicRecord>>>(
    `/employees/${employeeId}/academic-records`,
    { params: cleanParams(params) },
  );
  return res.data.data;
}

export async function createAcademicRecord(
  employeeId: string,
  payload: CreateAcademicRecordPayload,
): Promise<AcademicRecord> {
  const res = await http.post<ApiSuccess<AcademicRecord>>(`/employees/${employeeId}/academic-records`, payload);
  return res.data.data;
}

export async function updateAcademicRecord(
  id: string,
  payload: UpdateAcademicRecordPayload,
): Promise<AcademicRecord> {
  const res = await http.patch<ApiSuccess<AcademicRecord>>(`/academic-records/${id}`, payload);
  return res.data.data;
}

export async function deleteAcademicRecord(id: string): Promise<AcademicRecord> {
  const res = await http.delete<ApiSuccess<AcademicRecord>>(`/academic-records/${id}`);
  return res.data.data;
}
