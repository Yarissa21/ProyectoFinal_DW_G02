import type { Employee } from '../types/employee';

const dateFormatter = new Intl.DateTimeFormat('es-GT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});
const dateTimeFormatter = new Intl.DateTimeFormat('es-GT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
const moneyFormatter = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' });

type NameParts = Pick<Employee, 'firstName' | 'middleName' | 'lastName' | 'secondLastName'>;

export function fullName(employee: NameParts): string {
  return [employee.firstName, employee.middleName, employee.lastName, employee.secondLastName]
    .filter(Boolean)
    .join(' ');
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date);
}

export function toDateInput(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : '';
}

export function formatMoney(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const amount = Number(value);
  return Number.isNaN(amount) ? value : moneyFormatter.format(amount);
}