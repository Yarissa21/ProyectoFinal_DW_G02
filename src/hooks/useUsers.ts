import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, listUsers } from '../services/userService';
import type { UserListParams } from '../types/user';

export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: ['users', params] as const,
    queryFn: () => listUsers(params),
    staleTime: 60_000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}