import type { EmploymentStatus, RecordStatus } from './employee';
import type { AcademicRecordType } from './academic';

export interface SelfServiceBranch {
  id: string;
  code: string;
  name: string;
}

export interface SelfServiceDepartment {
  id: string;
  code: string;
  name: string;
  branch: SelfServiceBranch;
}

export interface SelfServiceCatalog {
  id: string;
  code: string;
  name: string;
}

export interface SelfServiceProfile {
  employeeId: string;
  userId: string;
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
  department: SelfServiceDepartment;
  position: SelfServiceCatalog;
  updatedAt: string;
}

export interface UpdateSelfServiceContactPayload {
  address?: string;
  phone?: string;
}

export interface MyAcademicRecordListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: AcademicRecordType;
}
