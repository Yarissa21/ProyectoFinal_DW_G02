import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { logout } from '../services/authService';
import type { RoleCode } from '../types/auth';

interface NavItem {
  path: string;
  label: string;
  allowedRoles: RoleCode[];
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', allowedRoles: ['ADMIN', 'HR_MANAGER'] },
  { path: '/inicio', label: 'Inicio', allowedRoles: ['EMPLOYEE'] },
  { path: '/empleados', label: 'Empleados', allowedRoles: ['ADMIN', 'HR_MANAGER'] },
];

function AppLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const visibleItems = navItems.filter(
    (item) => user && item.allowedRoles.includes(user.role.code)
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <span className="text-lg font-bold">RRHH</span>

          <nav aria-label="Principal" className="flex flex-wrap gap-1">
            {visibleItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
                    isActive ? 'bg-white/20' : 'text-white/80 hover:bg-white/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {user && (
            <div className="flex items-center gap-3 text-sm">
              <span className="hidden sm:inline">
                {user.firstName} {user.lastName}
              </span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">
                {user.role.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-white/40 px-3 py-1.5 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;