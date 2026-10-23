import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { EmploymentStatusBadge, RecordStatusBadge } from '../components/EmployeeBadges';
import ProfileLoader from '../components/selfService/ProfileLoader';
import { useAuthStore } from '../store/authStore';
import type { SelfServiceProfile } from '../types/selfService';
import { formatDate } from '../utils/format';
import { STAT_GRID_CLASS } from '../utils/statGrid';

const cardLinkClass =
  'block rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600';

function HomeContent({ profile }: { profile: SelfServiceProfile }) {
  return (
    <div className="space-y-6">
      <dl className={`${STAT_GRID_CLASS} lg:grid-cols-4`}>
        <StatCard
          tone="success"
          label="Estado laboral"
          value={<EmploymentStatusBadge status={profile.status} />}
        />
        <StatCard
          tone="info"
          label="Estado del expediente"
          value={<RecordStatusBadge status={profile.recordStatus} />}
        />
        <StatCard
          tone="brand"
          label="Departamento"
          value={<span className="text-lg break-words">{profile.department.name}</span>}
          hint={profile.position.name}
          className="col-span-2 lg:col-span-1"
        />
        <StatCard
          tone="warning"
          label="Fecha de ingreso"
          value={<span className="text-lg">{formatDate(profile.hireDate)}</span>}
          className="col-span-2 lg:col-span-1"
        />
      </dl>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:[&>:last-child:nth-child(odd)]:col-span-2">
        <Link to="/mi-perfil" className={cardLinkClass}>
          <h2 className="font-semibold text-slate-900">Mi perfil y contacto</h2>
          <p className="mt-1 text-sm text-slate-600">
            Consulta tus datos laborales y actualiza tu dirección y tu teléfono.
          </p>
        </Link>
        <Link to="/mis-academicos" className={cardLinkClass}>
          <h2 className="font-semibold text-slate-900">Mis registros académicos</h2>
          <p className="mt-1 text-sm text-slate-600">Revisa los estudios registrados en tu expediente.</p>
        </Link>
        <Link to="/mis-documentos" className={cardLinkClass}>
          <h2 className="font-semibold text-slate-900">Mis documentos</h2>
          <p className="mt-1 text-sm text-slate-600">Consulta y descarga los documentos de tu expediente.</p>
        </Link>
      </div>
    </div>
  );
}

function EmployeeHomePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <section aria-labelledby="home-title" className="space-y-6">
      <PageHeader
        id="home-title"
        title={user ? `Hola, ${user.firstName}` : 'Inicio'}
        description="Este es el resumen de tu información laboral."
      />
      <ProfileLoader>{(profile) => <HomeContent profile={profile} />}</ProfileLoader>
    </section>
  );
}

export default EmployeeHomePage;
