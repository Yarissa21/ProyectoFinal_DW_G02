import { http } from './http';
import type { ApiSuccess } from '../types/api';
import type { AcademicRecord } from '../types/academic';
import type { Paginated } from '../types/pagination';
import type {
  MyAcademicRecordListParams,
  SelfServiceProfile,
  UpdateSelfServiceContactPayload,
} from '../types/selfService';

function cleanParams<T extends object>(params: T): Record<string, string | number> {
  const clean: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    clean[key] = value as string | number;
  }
  return clean;
}

export async function getMyProfile(): Promise<SelfServiceProfile> {
  const res = await http.get<ApiSuccess<SelfServiceProfile>>('/self-service/profile');
  return res.data.data;
}

export async function updateMyContact(payload: UpdateSelfServiceContactPayload): Promise<SelfServiceProfile> {
  const res = await http.patch<ApiSuccess<SelfServiceProfile>>('/self-service/contact', payload);
  return res.data.data;
}

export async function listMyAcademicRecords(
  params: MyAcademicRecordListParams,
): Promise<Paginated<AcademicRecord>> {
  const res = await http.get<ApiSuccess<Paginated<AcademicRecord>>>('/self-service/academic-records', {
    params: cleanParams(params),
  });
  return res.data.data;
}
