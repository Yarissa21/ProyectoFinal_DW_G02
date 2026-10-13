import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyProfile, listMyAcademicRecords, updateMyContact } from '../services/selfServiceService';
import { useAuthStore } from '../store/authStore';
import type { MyAcademicRecordListParams, UpdateSelfServiceContactPayload } from '../types/selfService';

// El cliente de consultas no se limpia al cerrar sesión, así que el id del usuario
// forma parte de la clave: un empleado nunca ve en caché los datos de otro.
export const selfServiceKeys = {
  all: (userId: string) => ['self-service', userId] as const,
  profile: (userId: string) => [...selfServiceKeys.all(userId), 'profile'] as const,
  academic: (userId: string, params: MyAcademicRecordListParams) =>
    [...selfServiceKeys.all(userId), 'academic-records', params] as const,
};

export function useMyProfile() {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  return useQuery({
    queryKey: selfServiceKeys.profile(userId),
    queryFn: getMyProfile,
    enabled: userId !== '',
  });
}

export function useUpdateMyContact() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? '');
  return useMutation({
    mutationFn: (payload: UpdateSelfServiceContactPayload) => updateMyContact(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(selfServiceKeys.profile(userId), profile);
    },
  });
}

export function useMyAcademicRecords(params: MyAcademicRecordListParams) {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  return useQuery({
    queryKey: selfServiceKeys.academic(userId, params),
    queryFn: () => listMyAcademicRecords(params),
    enabled: userId !== '',
    placeholderData: keepPreviousData,
  });
}
