import { listEmployees } from '../services/employeeService';
import type { EmployeeFormValues } from '../schemas/employeeSchema';

export type DuplicateField = 'dpi' | 'email';

const LOOKUP_LIMIT = 50;

async function existsWith(
  term: string,
  matches: (value: string) => boolean,
  pick: (employee: { dpi: string; email?: string | null }) => string | null | undefined,
  excludeId?: string,
): Promise<boolean> {
  const page = await listEmployees({ search: term, limit: LOOKUP_LIMIT });
  return page.items.some((employee) => {
    if (employee.id === excludeId) return false;
    const value = pick(employee);
    return typeof value === 'string' && matches(value);
  });
}

export async function findDuplicateFields(
  values: Pick<EmployeeFormValues, 'dpi' | 'email'>,
  excludeId?: string,
): Promise<DuplicateField[]> {
  const dpi = values.dpi.trim();
  const email = values.email.trim().toLowerCase();

  const [dpiTaken, emailTaken] = await Promise.all([
    existsWith(dpi, (value) => value.trim() === dpi, (employee) => employee.dpi, excludeId),
    existsWith(email, (value) => value.trim().toLowerCase() === email, (employee) => employee.email, excludeId),
  ]);

  const fields: DuplicateField[] = [];
  if (dpiTaken) fields.push('dpi');
  if (emailTaken) fields.push('email');
  return fields;
}