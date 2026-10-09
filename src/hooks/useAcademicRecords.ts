import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAcademicRecord,
  deleteAcademicRecord,
  listAcademicRecords,
  updateAcademicRecord,
} from '../services/academicService';
import type {
  AcademicRecordListParams,
  CreateAcademicRecordPayload,
  UpdateAcademicRecordPayload,
} from '../types/academic';

export const academicKeys = {
  all: ['academic-records'] as const,
  lists: (employeeId: string) => [...academicKeys.all, 'list', employeeId] as const,
  list: (employeeId: string, params: AcademicRecordListParams) =>
    [...academicKeys.lists(employeeId), params] as const,
};

export function useAcademicRecords(employeeId: string | undefined, params: AcademicRecordListParams) {
  return useQuery({
    queryKey: academicKeys.list(employeeId ?? '', params),
    queryFn: () => listAcademicRecords(employeeId as string, params),
    enabled: !!employeeId,
    placeholderData: keepPreviousData,
  });
}

function useInvalidateAcademicData(employeeId: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: academicKeys.lists(employeeId) });
    void queryClient.invalidateQueries({ queryKey: ['reports'] });
  };
}

export function useCreateAcademicRecord(employeeId: string) {
  const invalidate = useInvalidateAcademicData(employeeId);
  return useMutation({
    mutationFn: (payload: CreateAcademicRecordPayload) => createAcademicRecord(employeeId, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateAcademicRecord(employeeId: string, id: string) {
  const invalidate = useInvalidateAcademicData(employeeId);
  return useMutation({
    mutationFn: (payload: UpdateAcademicRecordPayload) => updateAcademicRecord(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteAcademicRecord(employeeId: string, id: string) {
  const invalidate = useInvalidateAcademicData(employeeId);
  return useMutation({
    mutationFn: () => deleteAcademicRecord(id),
    onSuccess: invalidate,
  });
}
