import type { UserRoleCode } from '../types/user';

export const USER_ROLE_LABELS: Record<UserRoleCode, string> = {
  ADMIN: 'Administrador',
  HR_MANAGER: 'Recursos humanos',
  EMPLOYEE: 'Empleado',
};

export const USER_ROLE_VALUES = Object.keys(USER_ROLE_LABELS) as UserRoleCode[];

export function toRoleCode(code: string): UserRoleCode {
  return USER_ROLE_VALUES.find((role) => role === code) ?? 'EMPLOYEE';
}