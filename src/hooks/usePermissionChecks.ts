import { useQuery } from '@tanstack/react-query';
import { checkAdminPermission, checkHrPermission } from '../services/permissionService';

export const permissionKeys = {
  admin: ['permissions', 'admin'] as const,
  hr: ['permissions', 'hr'] as const,
};

export function useAdminPermissionCheck() {
  return useQuery({ queryKey: permissionKeys.admin, queryFn: checkAdminPermission, staleTime: 0 });
}

export function useHrPermissionCheck() {
  return useQuery({ queryKey: permissionKeys.hr, queryFn: checkHrPermission, staleTime: 0 });
}