import type { EmploymentStatus } from './employee';

export interface AcademicSummaryParams {
  branchId?: string;
  departmentId?: string;
  status?: EmploymentStatus;
}

export interface AcademicTypeCount {
  key: string;
  count: number;
}

export interface AcademicDepartmentSummary {
  branchId: string;
  branchCode: string;
  branchName: string;
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  employeeCount: number;
  employeesWithRecords: number;
  recordCount: number;
}

export interface AcademicInstitutionSummary {
  institution: string;
  count: number;
}

export interface AcademicSummaryReport {
  totalEmployees: number;
  employeesWithRecords: number;
  employeesWithoutRecords: number;
  totalAcademicRecords: number;
  coveragePercentage: string;
  byType: AcademicTypeCount[];
  byDepartment: AcademicDepartmentSummary[];
  topInstitutions: AcademicInstitutionSummary[];
  generatedAt: string;
}
