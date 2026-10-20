import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { employeeKeys } from './useEmployees';
import { createUser, listUsers, updateUser, updateUserStatus } from '../services/userService';
import type { UpdateUserPayload, UpdateUserStatusPayload, UserListParams } from '../types/user';

export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: ['users', params] as const,
    queryFn: () => listUsers(params),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

function useRefreshUsers() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['users'] });
    void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
  };
}

export function useCreateUser() {
  const refresh = useRefreshUsers();
  return useMutation({ mutationFn: createUser, onSuccess: refresh });
}

export function useUpdateUser(id: string) {
  const refresh = useRefreshUsers();
  return useMutation({ mutationFn: (payload: UpdateUserPayload) => updateUser(id, payload), onSuccess: refresh });
}

export function useUpdateUserStatus(id: string) {
  const refresh = useRefreshUsers();
  return useMutation({
    mutationFn: (payload: UpdateUserStatusPayload) => updateUserStatus(id, payload),
    onSuccess: refresh,
  });
}