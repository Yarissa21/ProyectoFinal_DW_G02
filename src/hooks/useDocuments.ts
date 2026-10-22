import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createDocumentType,
  deleteEmployeeDocument,
  listDocumentTypes,
  listEmployeeDocuments,
  updateDocumentType,
  updateDocumentTypeStatus,
  uploadEmployeeDocument,
} from '../services/documentService';
import type {
  CreateDocumentTypePayload,
  EmployeeDocumentListParams,
  UpdateDocumentTypePayload,
  UploadDocumentPayload,
} from '../types/document';

export const documentKeys = {
  all: ['employee-documents'] as const,
  lists: (employeeId: string) => [...documentKeys.all, 'list', employeeId] as const,
  list: (employeeId: string, params: EmployeeDocumentListParams) =>
    [...documentKeys.lists(employeeId), params] as const,
  types: ['document-types'] as const,
};

export function useDocumentTypes(includeInactive = false) {
  return useQuery({
    queryKey: [...documentKeys.types, { includeInactive }] as const,
    queryFn: () => listDocumentTypes(includeInactive),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEmployeeDocuments(employeeId: string, params: EmployeeDocumentListParams) {
  return useQuery({
    queryKey: documentKeys.list(employeeId, params),
    queryFn: () => listEmployeeDocuments(employeeId, params),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateDocuments(employeeId: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: documentKeys.lists(employeeId) });
    void queryClient.invalidateQueries({ queryKey: ['employees'] });
    void queryClient.invalidateQueries({ queryKey: ['reports'] });
  };
}

export function useUploadDocument(employeeId: string) {
  const invalidate = useInvalidateDocuments(employeeId);
  return useMutation({
    mutationFn: (payload: UploadDocumentPayload) => uploadEmployeeDocument(employeeId, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteDocument(employeeId: string, id: string) {
  const invalidate = useInvalidateDocuments(employeeId);
  return useMutation({
    mutationFn: () => deleteEmployeeDocument(id),
    onSuccess: invalidate,
  });
}
function useRefreshDocumentTypes() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: documentKeys.types });
    void queryClient.invalidateQueries({ queryKey: documentKeys.all });
    void queryClient.invalidateQueries({ queryKey: ['employees'] });
    void queryClient.invalidateQueries({ queryKey: ['reports'] });
  };
}

export function useCreateDocumentType() {
  const refresh = useRefreshDocumentTypes();
  return useMutation({
    mutationFn: (payload: CreateDocumentTypePayload) => createDocumentType(payload),
    onSuccess: refresh,
  });
}

export function useUpdateDocumentType(id: string) {
  const refresh = useRefreshDocumentTypes();
  return useMutation({
    mutationFn: (payload: UpdateDocumentTypePayload) => updateDocumentType(id, payload),
    onSuccess: refresh,
  });
}

export function useUpdateDocumentTypeStatus(id: string) {
  const refresh = useRefreshDocumentTypes();
  return useMutation({
    mutationFn: (isActive: boolean) => updateDocumentTypeStatus(id, isActive),
    onSuccess: refresh,
  });
}