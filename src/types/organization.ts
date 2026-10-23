import type { SortOrder } from './pagination';

export interface BranchSummary {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface Branch extends BranchSummary {
  address: string;
  phone?: string | null;
  email?: string | null;
  isHeadquarters: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department extends BranchSummary {
  description?: string | null;
  branch: BranchSummary;
  createdAt: string;
  updatedAt: string;
}

export interface Position extends BranchSummary {
  description?: string | null;
  departments: BranchSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface OrgListParams {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface CreateBranchPayload {
  code: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  isHeadquarters?: boolean;
  isActive?: boolean;
}
export type UpdateBranchPayload = Partial<Omit<CreateBranchPayload, 'isActive'>>;

export interface CreateDepartmentPayload {
  code: string;
  name: string;
  branchId: string;
  description?: string;
  isActive?: boolean;
}
export type UpdateDepartmentPayload = Partial<Omit<CreateDepartmentPayload, 'isActive'>>;

export interface CreatePositionPayload {
  code: string;
  name: string;
  departmentIds: string[];
  description?: string;
  isActive?: boolean;
}
export type UpdatePositionPayload = Partial<Omit<CreatePositionPayload, 'isActive'>>;

export interface UpdateOrgStatusPayload {
  isActive: boolean;
}