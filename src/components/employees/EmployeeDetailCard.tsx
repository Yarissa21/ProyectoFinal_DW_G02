import type { ReactNode } from 'react';
import { EmploymentStatusBadge } from '../EmployeeBadges';
import type { Employee } from '../../types/employee';
import { formatDate, formatMoney } from '../../utils/format';

interface EmployeeDetailCardProps {
  employee: Employee;
}

const EMPTY = '—';

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 id={id} className="text-base font-semibold text-slate-900">
        {title}
      </h2>
      <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function Item({ label, wide = false, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <dt className="text-xs font-medium text-slate-600">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-slate-900">{children}</dd>
    </div>
  );
}

function EmployeeDetailCard({ employee }: EmployeeDetailCardProps) {
  return (
    <div className="space-y-4">
      <Section id="detail-personal" title="Datos personales">
        <Item label="Primer nombre">{employee.firstName}</Item>
        <Item label="Segundo nombre">{employee.middleName || EMPTY}</Item>
        <Item label="Primer apellido">{employee.lastName}</Item>
        <Item label="Segundo apellido">{employee.secondLastName || EMPTY}</Item>
        <Item label="DPI">{employee.dpi}</Item>
        <Item label="Fecha de nacimiento">{formatDate(employee.birthDate)}</Item>
        <Item label="Teléfono">{employee.phone || EMPTY}</Item>
        <Item label="Correo electrónico">{employee.email || EMPTY}</Item>
        <Item label="Dirección" wide>
          {employee.address}
        </Item>
      </Section>

      <Section id="detail-work" title="Datos laborales">
        <Item label="Departamento">{employee.department.name}</Item>
        <Item label="Puesto">{employee.position.name}</Item>
        <Item label="Salario base">{formatMoney(employee.baseSalary)}</Item>
        <Item label="Fecha de ingreso">{formatDate(employee.hireDate)}</Item>
        <Item label="Estado laboral">
          <EmploymentStatusBadge status={employee.status} />
        </Item>
        {employee.terminationDate && <Item label="Fecha de baja">{formatDate(employee.terminationDate)}</Item>}
        <Item label="Usuario vinculado">{employee.user?.email ?? 'Sin cuenta vinculada'}</Item>
      </Section>
    </div>
  );
}

export default EmployeeDetailCard;