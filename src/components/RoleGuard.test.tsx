import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import RoleGuard from './RoleGuard';
import { useAuthStore } from '../store/authStore';
import { administradora, crearSesion, gestoraRrhh } from '../test/datos';
import type { AuthUser } from '../types/auth';

function mostrarSeccionDeAdministracion() {
  render(
    <MemoryRouter initialEntries={['/usuarios']}>
      <Routes>
        <Route path="/login" element={<h1>Pantalla de login</h1>} />
        <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
          <Route path="/usuarios" element={<p>Listado de usuarios</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

function iniciarSesionComo(usuario: AuthUser) {
  const { user, tokens } = crearSesion(usuario);
  useAuthStore.getState().setSession(user, tokens);
}

describe('Acceso a secciones según el rol', () => {
  it('deja entrar a la administradora a una sección solo para administración', () => {
    iniciarSesionComo(administradora);

    mostrarSeccionDeAdministracion();

    expect(screen.getByText('Listado de usuarios')).toBeInTheDocument();
  });

  it('bloquea a la gestora de RRHH en una sección solo para administración', () => {
    iniciarSesionComo(gestoraRrhh);

    mostrarSeccionDeAdministracion();

    expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeInTheDocument();
    expect(screen.getByText('Tu rol no tiene permiso para ver esta sección.')).toBeInTheDocument();
    expect(screen.queryByText('Listado de usuarios')).not.toBeInTheDocument();
  });
});