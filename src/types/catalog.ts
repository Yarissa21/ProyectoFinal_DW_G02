export interface DepartmentOption {
  id: string;
  code: string;
  name: string;
  description?: string | null;
}

export interface PositionOption {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  departmentIds: string[];
}

export interface EmployeeCatalogs {
  departments: DepartmentOption[];
  positions: PositionOption[];
}