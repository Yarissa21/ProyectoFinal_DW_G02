import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listMyDocuments } from '../services/myDocumentService';
import { useAuthStore } from '../store/authStore';
import type { MyDocumentListParams } from '../types/document';

export function useMyDocuments(params: MyDocumentListParams) {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  return useQuery({
    queryKey: ['self-service', userId, 'documents', params] as const,
    queryFn: () => listMyDocuments(params),
    enabled: userId !== '',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}