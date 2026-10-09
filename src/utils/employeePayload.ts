import type { CreateEmployeePayload, Employee, UpdateEmployeePayload } from '../types/employee';
import type { EmployeeFormValues } from '../schemas/employeeSchema';
import { toDateInput } from './format';

export const EMPTY_FORM_VALUES: EmployeeFormValues = {
  dpi: '',
  firstName: '',
  middleName: '',
  lastName: '',
  secondLastName: '',
  birthDate: '',
  address: '',
  phone: '',
  email: '',
  baseSalary: '',
  hireDate: '',
  departmentId: '',
  positionId: '',
};

export function employeeToFormValues(employee: Employee): EmployeeFormValues {
  return {
    dpi: employee.dpi,
    firstName: employee.firstName,
    middleName: employee.middleName ?? '',
    lastName: employee.lastName,
    secondLastName: employee.secondLastName ?? '',
    birthDate: toDateInput(employee.birthDate),
    address: employee.address,
    phone: employee.phone ?? '',
    email: employee.email ?? '',
    baseSalary: employee.baseSalary,
    hireDate: toDateInput(employee.hireDate),
    departmentId: employee.department.id,
    positionId: employee.position.id,
  };
}

function normalizeSalary(value: string): string {
  return Number(value).toFixed(2);
}

export function toCreatePayload(values: EmployeeFormValues): CreateEmployeePayload {
  const payload: CreateEmployeePayload = {
    dpi: values.dpi,
    firstName: values.firstName,
    lastName: values.lastName,
    birthDate: values.birthDate,
    address: values.address,
    baseSalary: normalizeSalary(values.baseSalary),
    hireDate: values.hireDate,
    departmentId: values.departmentId,
    positionId: values.positionId,
  };
  if (values.middleName) payload.middleName = values.middleName;
  if (values.secondLastName) payload.secondLastName = values.secondLastName;
  if (values.phone) payload.phone = values.phone;
  if (values.email) payload.email = values.email;
  return payload;
}

const TEXT_FIELDS = [
  'dpi',
  'firstName',
  'middleName',
  'lastName',
  'secondLastName',
  'birthDate',
  'address',
  'phone',
  'email',
  'hireDate',
  'departmentId',
  'positionId',
] as const;

export function toUpdatePayload(values: EmployeeFormValues, employee: Employee): UpdateEmployeePayload {
  const original = employeeToFormValues(employee);
  const payload: UpdateEmployeePayload = {};

  for (const key of TEXT_FIELDS) {
    if (values[key] !== original[key]) payload[key] = values[key];
  }
  if (Number(values.baseSalary) !== Number(original.baseSalary)) {
    payload.baseSalary = normalizeSalary(values.baseSalary);
  }
  return payload;
}