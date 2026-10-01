import type { RoleCode } from '../types/auth';

export function homePathForRole(role: RoleCode): string {
  return role === 'EMPLOYEE' ? '/inicio' : '/dashboard';
}