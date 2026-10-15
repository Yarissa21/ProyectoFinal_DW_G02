import type { CreateUserPayload } from '../types/user';

export const USER_ROLE_LABELS: Record<CreateUserPayload['roleCode'], string> = {
  ADMIN: 'Administrador',
  HR_MANAGER: 'Recursos humanos',
  EMPLOYEE: 'Empleado',
};

export const USER_ROLE_VALUES = Object.keys(USER_ROLE_LABELS) as CreateUserPayload['roleCode'][];