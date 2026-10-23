import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface SectionLink {
  to: string;
  label: string;
  adminOnly?: boolean;
}

const SECTION_LINKS: SectionLink[] = [
  { to: '/empleados', label: 'Empleados' },
  { to: '/empleados/resumen', label: 'Resumen empleados' },
  { to: '/academicos/resumen', label: 'Resumen académicos' },
  { to: '/usuarios', label: 'Usuarios', adminOnly: true },
];

function EmployeesSectionLayout() {
  const isAdmin = useAuthStore((state) => state.user?.role.code === 'ADMIN');
  const links = SECTION_LINKS.filter((link) => !link.adminOnly || isAdmin);

  return (
    <div className="space-y-5">
      <nav aria-label="Secciones de personal" className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) =>
              `-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 ${
                isActive
                  ? 'border-blue-600 text-blue-800'
                  : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}

export default EmployeesSectionLayout;