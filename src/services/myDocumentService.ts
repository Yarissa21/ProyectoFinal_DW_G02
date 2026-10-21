import { http } from './http';
import type { ApiSuccess } from '../types/api';
import type { MyDocument, MyDocumentListParams } from '../types/document';
import type { Paginated } from '../types/pagination';

function cleanParams<T extends object>(params: T): Record<string, string | number> {
  const clean: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    clean[key] = value as string | number;
  }
  return clean;
}

export async function listMyDocuments(params: MyDocumentListParams): Promise<Paginated<MyDocument>> {
  const res = await http.get<ApiSuccess<Paginated<MyDocument>>>('/self-service/documents', {
    params: cleanParams(params),
  });
  return res.data.data;
}

export async function fetchMyDocumentFile(id: string): Promise<Blob> {
  const res = await http.get<Blob>(`/self-service/documents/${id}/download`, {
    responseType: 'blob',
    timeout: 60000,
  });
  return res.data;
}