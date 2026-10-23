import { http } from './http';
import type { ApiSuccess } from '../types/api';
import type { Paginated } from '../types/pagination';
import type {
  CreateDocumentTypePayload,
  DocumentType,
  EmployeeDocument,
  EmployeeDocumentListParams,
  UpdateDocumentTypePayload,
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

export async function listDocumentTypes(includeInactive = false): Promise<DocumentType[]> {
  const res = await http.get<ApiSuccess<DocumentType[]>>('/document-types', {
    params: includeInactive ? { includeInactive: true } : undefined,
  });
  return res.data.data;
}

export async function createDocumentType(payload: CreateDocumentTypePayload): Promise<DocumentType> {
  const res = await http.post<ApiSuccess<DocumentType>>('/document-types', payload);
  return res.data.data;
}

export async function updateDocumentType(id: string, payload: UpdateDocumentTypePayload): Promise<DocumentType> {
  const res = await http.patch<ApiSuccess<DocumentType>>(`/document-types/${id}`, payload);
  return res.data.data;
}

export async function updateDocumentTypeStatus(id: string, isActive: boolean): Promise<DocumentType> {
  const res = await http.patch<ApiSuccess<DocumentType>>(`/document-types/${id}/status`, { isActive });
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