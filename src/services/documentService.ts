import { http } from './http';
import type { ApiSuccess } from '../types/api';
import type { Paginated } from '../types/pagination';
import type {
  DocumentType,
  EmployeeDocument,
  EmployeeDocumentListParams,
  UploadDocumentPayload,
} from '../types/document';

function cleanParams<T extends object>(params: T): Record<string, string | number> {
  const clean: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    clean[key] = value as string | number;
  }
  return clean;
}

export async function listDocumentTypes(): Promise<DocumentType[]> {
  const res = await http.get<ApiSuccess<DocumentType[]>>('/document-types');
  return res.data.data;
}

export async function listEmployeeDocuments(
  employeeId: string,
  params: EmployeeDocumentListParams,
): Promise<Paginated<EmployeeDocument>> {
  const res = await http.get<ApiSuccess<Paginated<EmployeeDocument>>>(`/employees/${employeeId}/documents`, {
    params: cleanParams(params),
  });
  return res.data.data;
}

export async function uploadEmployeeDocument(
  employeeId: string,
  payload: UploadDocumentPayload,
): Promise<EmployeeDocument> {
  const form = new FormData();
  form.append('documentTypeId', payload.documentTypeId);
  form.append('file', payload.file);
  if (payload.expiresAt) form.append('expiresAt', payload.expiresAt);
  const res = await http.post<ApiSuccess<EmployeeDocument>>(`/employees/${employeeId}/documents`, form, {
    timeout: 60000,
  });
  return res.data.data;
}

export async function deleteEmployeeDocument(id: string): Promise<EmployeeDocument> {
  const res = await http.delete<ApiSuccess<EmployeeDocument>>(`/employee-documents/${id}`);
  return res.data.data;
}

export async function fetchEmployeeDocumentFile(id: string): Promise<Blob> {
  const res = await http.get<Blob>(`/employee-documents/${id}/download`, {
    responseType: 'blob',
    timeout: 60000,
  });
  return res.data;
}