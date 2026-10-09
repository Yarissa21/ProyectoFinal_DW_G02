import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  { path: '/empleados/resumen', label: 'Resumen empleados', allowedRoles: ['ADMIN', 'HR_MANAGER'] },
  { path: '/sistema', label: 'Estado del sistema', allowedRoles: ['ADMIN', 'HR_MANAGER'] },
];

const DESKTOP_QUERY = '(min-width: 768px)';

const focusClass = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-white';

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const visibleItems = navItems.filter(
    (item) => user && item.allowedRoles.includes(user.role.code)
  );

  const currentItem = visibleItems
    .filter((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0];

  const closeMenu = () => {
    setMenuOpen(false);
    openButtonRef.current?.focus();
  };

  useEffect(() => {
    if (!menuOpen) return;

    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        openButtonRef.current?.focus();
      }
    };
    const media = window.matchMedia(DESKTOP_QUERY);
    const handleMedia = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };

    document.addEventListener('keydown', handleKey);
    media.addEventListener('change', handleMedia);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
      media.removeEventListener('change', handleMedia);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              ref={openButtonRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
              className={`rounded-md border border-white/30 p-2 hover:bg-white/10 md:hidden ${focusClass}`}
            >
              <MenuIcon />
            </button>
            <span className="text-lg font-bold">RRHH</span>
            {currentItem && (
              <span className="truncate text-sm font-medium text-white/80 md:hidden">{currentItem.label}</span>
            )}
          </div>

          <nav aria-label="Principal" className="hidden gap-1 md:flex">
            {visibleItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium ${focusClass} ${
                    isActive ? 'bg-white/20' : 'text-white/80 hover:bg-white/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {user && (
            <div className="hidden items-center gap-3 text-sm md:flex">
              <span>
                {user.firstName} {user.lastName}
              </span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">
                {user.role.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className={`rounded-md border border-white/40 px-3 py-1.5 hover:bg-white/10 ${focusClass}`}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {menuOpen && (
        <div className="md:hidden">
          <div aria-hidden="true" onClick={closeMenu} className="fixed inset-0 z-40 bg-black/60" />
          <div
            id="menu-movil"
            role="dialog"
            aria-modal="true"
            aria-label="Menú principal"
            className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85%] flex-col overflow-y-auto bg-slate-900 p-4 text-white shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">RRHH</span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeMenu}
                aria-label="Cerrar menú"
                className={`rounded-md border border-white/30 p-2 hover:bg-white/10 ${focusClass}`}
              >
                <CloseIcon />
              </button>
            </div>

            <nav aria-label="Principal" className="mt-6 flex flex-col gap-1">
              {visibleItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2.5 text-base font-medium ${focusClass} ${
                      isActive ? 'bg-white/20' : 'text-white/80 hover:bg-white/10'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {user && (
              <div className="mt-auto space-y-3 border-t border-white/15 pt-4 text-sm">
                <div>
                  <p className="break-words font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-white/15 px-2 py-0.5 text-xs">
                    {user.role.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`w-full rounded-md border border-white/40 px-3 py-2 hover:bg-white/10 ${focusClass}`}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;