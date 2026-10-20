export interface UserAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  role: { code: string; name: string };
}

export type UserRoleCode = 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE';

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleCode: UserRoleCode;
}

export interface UpdateUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  roleCode?: UserRoleCode;
}

export interface UpdateUserStatusPayload {
  isActive: boolean;
}