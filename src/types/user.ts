export interface UserAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: { code: string; name: string };
}

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
  roleCode: 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE';
}