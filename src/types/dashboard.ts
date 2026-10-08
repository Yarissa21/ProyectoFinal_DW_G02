export type PayrollPeriodStatus = 'DRAFT' | 'CALCULATED' | 'CLOSED' | 'CANCELLED';

export interface DashboardWorkforce {
  total: number;
  active: number;
  suspended: number;
  retired: number;
}

export interface DashboardRecords {
  complete: number;
  inProgress: number;
  incomplete: number;
  compliancePercentage: string;
}

export interface DashboardDocuments {
  expired: number;
  expiringNext30Days: number;
}

export interface DashboardLeaveRequests {
  pending: number;
  upcomingApproved: number;
}

export interface DashboardPayrollPeriod {
  id: string;
  name: string;
  status: PayrollPeriodStatus;
  paymentDate: string;
  employeeCount: number;
}

export interface DashboardReport {
  workforce: DashboardWorkforce;
  records: DashboardRecords;
  leaveRequests: DashboardLeaveRequests;
  documents: DashboardDocuments;
  latestPayrollPeriod: DashboardPayrollPeriod | null;
  generatedAt: string;
}