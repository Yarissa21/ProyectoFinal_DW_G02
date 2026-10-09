import { Link, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { homePathForRole } from '../utils/roles';
import type { RoleCode } from '../types/auth';

interface RoleGuardProps {
  allowedRoles: RoleCode[];
}

function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role.code)) {
    return (
      <div role="alert" className="mx-auto max-w-md py-12 text-center">
        <h1 className="mb-2 text-xl font-semibold text-slate-900">Acceso restringido</h1>
        <p className="text-slate-600">
          Tu rol no tiene permiso para ver esta sección.
        </p>
        <Link
          to={homePathForRole(user.role.code)}
          className="mt-4 inline-block text-blue-700 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
        >
          Volver a mi inicio
        </Link>
      </div>
    );
  }

  return <Outlet />;
}

export default RoleGuard;