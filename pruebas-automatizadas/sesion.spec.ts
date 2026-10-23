import { expect, test } from '@playwright/test';
import { CLAVE_TOKEN, USUARIOS, iniciarSesion, simularApi } from './apiFalsa.ts';

test.describe('Renovación de la sesión', () => {
  test('mantiene la sesión al recargar la página', async ({ page }) => {
    const api = await simularApi(page);
    await iniciarSesion(page, 'empleado');
    await expect(page).toHaveURL(/\/inicio$/);
    const tokenAntes = api.tokenVigente();

    await page.reload();

    await expect(page).toHaveURL(/\/inicio$/);
    await expect(page.getByText(USUARIOS.empleado.nombre)).toBeVisible();
    expect(api.contar('POST', '/auth/refresh')).toBe(1);
    expect(api.tokenVigente()).not.toBe(tokenAntes);
  });

  test('avisa que la sesión venció cuando el token guardado ya no sirve', async ({ page }) => {
    await simularApi(page);
    await page.addInitScript((clave) => sessionStorage.setItem(clave, 'token-vencido'), CLAVE_TOKEN);

    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('status')).toContainText('Tu sesión venció. Inicia sesión de nuevo para continuar.');
  });
});