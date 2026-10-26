import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppLayout from './Header';
import { logout } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { crearSesion } from '../test/datos';

vi.mock('../services/authService', () => ({
  logout: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(logout).mockImplementation(async () => {
    useAuthStore.getState().clearSession();
  });
  const { user, tokens } = crearSesion();
  useAuthStore.getState().setSession(user, tokens);
});

function mostrarAplicacion() {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/login" element={<h1>Pantalla de login</h1>} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<p>Contenido del dashboard</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('Encabezado y cierre de sesión', () => {
  it('cierra la sesión y vuelve a la pantalla de login', async () => {
    const usuario = userEvent.setup();
    mostrarAplicacion();

    await usuario.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('heading', { name: 'Pantalla de login' })).toBeInTheDocument();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});