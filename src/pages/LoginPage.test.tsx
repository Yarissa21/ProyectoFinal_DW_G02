import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from './LoginPage';
import { login } from '../services/authService';
import { ApiError } from '../services/http';
import { useAuthStore } from '../store/authStore';
import { administradora, crearSesion } from '../test/datos';

vi.mock('../services/authService', () => ({
  login: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

function mostrarLogin() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<p>Pantalla del dashboard</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function enviarFormulario(correo: string, contrasena: string) {
  const usuario = userEvent.setup();
  if (correo) await usuario.type(screen.getByLabelText('Correo electrónico'), correo);
  if (contrasena) await usuario.type(screen.getByLabelText('Contraseña'), contrasena);
  await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
}

describe('Pantalla de login', () => {
  it('pide el correo y la contraseña cuando se envía vacío', async () => {
    mostrarLogin();

    await enviarFormulario('', '');

    expect(await screen.findByText('Ingresa tu correo electrónico')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu contraseña')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('envía las credenciales y entra al dashboard cuando son correctas', async () => {
    vi.mocked(login).mockImplementation(async () => {
      const { user, tokens } = crearSesion();
      useAuthStore.getState().setSession(user, tokens);
      return administradora;
    });
    mostrarLogin();

    await enviarFormulario('ana@ejemplo.test', 'Clave12345');

    expect(await screen.findByText('Pantalla del dashboard')).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith({ email: 'ana@ejemplo.test', password: 'Clave12345' });
  });

  it('muestra el error en español cuando las credenciales son incorrectas', async () => {
    vi.mocked(login).mockRejectedValue(
      new ApiError({
        status: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
        timestamp: '2026-10-22T12:00:00.000Z',
      }),
    );
    mostrarLogin();

    await enviarFormulario('ana@ejemplo.test', 'Contraseña2026');

    expect(await screen.findByRole('alert')).toHaveTextContent('El correo o la contraseña son incorrectos.');
    expect(screen.queryByText('Pantalla del dashboard')).not.toBeInTheDocument();
  });
});