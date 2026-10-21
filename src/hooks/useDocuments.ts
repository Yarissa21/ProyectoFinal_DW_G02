import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteEmployeeDocument,
  listDocumentTypes,
  listEmployeeDocuments,
  uploadEmployeeDocument,
} from '../services/documentService';
import type { EmployeeDocumentListParams, UploadDocumentPayload } from '../types/document';

export const documentKeys = {
  all: ['employee-documents'] as const,
  lists: (employeeId: string) => [...documentKeys.all, 'list', employeeId] as const,
  list: (employeeId: string, params: EmployeeDocumentListParams) =>
    [...documentKeys.lists(employeeId), params] as const,
  types: ['document-types'] as const,
};

export function useDocumentTypes() {
  return useQuery({
    queryKey: documentKeys.types,
    queryFn: listDocumentTypes,
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