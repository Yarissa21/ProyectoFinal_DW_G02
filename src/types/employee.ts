import type { SortOrder } from './pagination';

export type EmploymentStatus = 'ACTIVE' | 'SUSPENDED' | 'RETIRED';
export type RecordStatus = 'COMPLETE' | 'INCOMPLETE' | 'IN_PROGRESS';
export type EmploymentHistoryEventType =
  | 'BASELINE'
  | 'HIRED'
  | 'EMPLOYMENT_UPDATED'
  | 'STATUS_CHANGED'
  | 'DELETED';

export interface CatalogItem {
  id: string;
  code: string;
  name: string;
}

export interface LinkedUser {
  id: string;
  email: string;
}

export interface Employee {
  id: string;
  dpi: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  secondLastName?: string | null;
  birthDate: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  baseSalary: string;
  hireDate: string;
  terminationDate?: string | null;
  status: EmploymentStatus;
  recordStatus: RecordStatus;
  department: CatalogItem;
  position: CatalogItem;
  user?: LinkedUser | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeePayload {
  dpi: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  birthDate: string;
  address: string;
  phone?: string;
  email?: string;
  baseSalary: string;
  hireDate: string;
  departmentId: string;
  positionId: string;
  userId?: string;
}

export type UpdateEmployeePayload = Partial<CreateEmployeePayload>;

export interface UpdateEmploymentStatusPayload {
  status: EmploymentStatus;
  terminationDate?: string;
}

export type EmployeeSortField = 'lastName' | 'hireDate';

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: EmployeeSortField;
  sortOrder?: SortOrder;
  status?: EmploymentStatus;
  recordStatus?: RecordStatus;
  departmentId?: string;
  positionId?: string;
}

export interface HistoryCatalogSnapshot {
  id: string;
  code: string;
  name: string;
}

export interface EmploymentHistoryEntry {
  id: string;
  eventType: EmploymentHistoryEventType;
  effectiveAt: string;
  status: EmploymentStatus;
  department: HistoryCatalogSnapshot;
  position: HistoryCatalogSnapshot;
  baseSalary: string;
  hireDate: string;
  terminationDate?: string | null;
  changedBy?: { id: string; email: string } | null;
  createdAt: string;
}

export interface EmploymentHistoryParams {
  page?: number;
  limit?: number;
  eventType?: EmploymentHistoryEventType;
  from?: string;
  to?: string;
  sortOrder?: SortOrder;
}

export interface ReportCount {
  key: string;
  count: number;
}

export interface DepartmentHeadcount {
  id: string;
  code: string;
  name: string;
  count: number;
}

export interface EmployeeSummaryReport {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  monthlyPayrollBase: string;
  byEmploymentStatus: ReportCount[];
  byRecordStatus: ReportCount[];
  byDepartment: DepartmentHeadcount[];
  generatedAt: string;
}