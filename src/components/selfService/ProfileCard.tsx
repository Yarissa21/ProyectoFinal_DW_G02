import type { ReactNode } from 'react';
import { EmploymentStatusBadge, RecordStatusBadge } from '../EmployeeBadges';
import type { SelfServiceProfile } from '../../types/selfService';
import { formatDate, formatDateTime, formatMoney } from '../../utils/format';

const EMPTY = '—';

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 id={id} className="flex items-center gap-2 text-base font-semibold text-slate-900">
        <span aria-hidden="true" className="h-5 w-1 rounded-full bg-blue-500" />
        {title}
      </h2>
      <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-600">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-slate-900">{children}</dd>
    </div>
  );
}

function ProfileCard({ profile }: { profile: SelfServiceProfile }) {
  const name = [profile.firstName, profile.middleName, profile.lastName, profile.secondLastName]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="space-y-4">
      <Section id="profile-personal" title="Datos personales">
        <Item label="Nombre completo">{name}</Item>
        <Item label="DPI">{profile.dpi}</Item>
        <Item label="Fecha de nacimiento">{formatDate(profile.birthDate)}</Item>
        <Item label="Correo electrónico">{profile.email || EMPTY}</Item>
      </Section>

      <Section id="profile-work" title="Datos laborales">
        <Item label="Sede">{profile.department.branch.name}</Item>
        <Item label="Departamento">{profile.department.name}</Item>
        <Item label="Puesto">{profile.position.name}</Item>
        <Item label="Salario base">{formatMoney(profile.baseSalary)}</Item>
        <Item label="Fecha de ingreso">{formatDate(profile.hireDate)}</Item>
        {profile.terminationDate && <Item label="Fecha de baja">{formatDate(profile.terminationDate)}</Item>}
        <Item label="Estado laboral">
          <EmploymentStatusBadge status={profile.status} />
        </Item>
        <Item label="Estado del expediente">
          <RecordStatusBadge status={profile.recordStatus} />
        </Item>
        <Item label="Última actualización">{formatDateTime(profile.updatedAt)}</Item>
      </Section>
    </div>
  );
}

export default ProfileCard;
