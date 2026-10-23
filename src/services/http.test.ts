import { http as mswHttp, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { fetchMe } from './authService';
import { useAuthStore } from '../store/authStore';
import { URL_API, administradora, crearSesion, respuestaDeError, respuestaExitosa } from '../test/datos';
import { servidor } from '../test/servidor';

function iniciarSesion() {
  const { user, tokens } = crearSesion(administradora, 'inicial');
  useAuthStore.getState().setSession(user, tokens);
}

describe('Renovación automática de la sesión', () => {
  it('renueva el token cuando la API responde 401 y repite la solicitud', async () => {
    iniciarSesion();
    const sesionNueva = crearSesion(administradora, 'nuevo');
    let renovaciones = 0;
    servidor.use(
      mswHttp.get(`${URL_API}/auth/me`, ({ request }) => {
        if (request.headers.get('authorization') === 'Bearer token-de-acceso-nuevo') {
          return HttpResponse.json(respuestaExitosa(administradora));
        }
        return HttpResponse.json(respuestaDeError('UNAUTHORIZED', 'Token vencido'), { status: 401 });
      }),
      mswHttp.post(`${URL_API}/auth/refresh`, async ({ request }) => {
        renovaciones += 1;
        expect(await request.json()).toEqual({ refreshToken: 'token-de-renovacion-inicial' });
        return HttpResponse.json(respuestaExitosa(sesionNueva));
      }),
    );

    const usuario = await fetchMe();

    expect(usuario).toEqual(administradora);
    expect(renovaciones).toBe(1);
    expect(useAuthStore.getState().accessToken).toBe('token-de-acceso-nuevo');
    expect(useAuthStore.getState().refreshToken).toBe('token-de-renovacion-nuevo');
  });

  it('hace una sola renovación cuando varias solicitudes fallan al mismo tiempo', async () => {
    iniciarSesion();
    const sesionNueva = crearSesion(administradora, 'nuevo');
    let renovaciones = 0;
    servidor.use(
      mswHttp.get(`${URL_API}/auth/me`, ({ request }) => {
        if (request.headers.get('authorization') === 'Bearer token-de-acceso-nuevo') {
          return HttpResponse.json(respuestaExitosa(administradora));
        }
        return HttpResponse.json(respuestaDeError('UNAUTHORIZED', 'Token vencido'), { status: 401 });
      }),
      mswHttp.post(`${URL_API}/auth/refresh`, () => {
        renovaciones += 1;
        return HttpResponse.json(respuestaExitosa(sesionNueva));
      }),
    );

    await Promise.all([fetchMe(), fetchMe(), fetchMe()]);

    expect(renovaciones).toBe(1);
  });

  it('cierra la sesión como vencida cuando la renovación falla', async () => {
    iniciarSesion();
    servidor.use(
      mswHttp.get(`${URL_API}/auth/me`, () =>
        HttpResponse.json(respuestaDeError('UNAUTHORIZED', 'Token vencido'), { status: 401 }),
      ),
      mswHttp.post(`${URL_API}/auth/refresh`, () =>
        HttpResponse.json(respuestaDeError('INVALID_REFRESH_TOKEN', 'Token inválido'), { status: 401 }),
      ),
    );

    await expect(fetchMe()).rejects.toMatchObject({ status: 401 });

    const estado = useAuthStore.getState();
    expect(estado.isAuthenticated).toBe(false);
    expect(estado.logoutReason).toBe('expired');
  });
});