import { expect, test } from '@playwright/test';
import { USUARIOS, iniciarSesion, simularApi } from './apiFalsa.ts';

test.describe('Inicio de sesión', () => {
  test('muestra un error cuando el correo o la contraseña son incorrectos', async ({ page }) => {
    await simularApi(page);
    await page.goto('/login');
    await page.getByLabel('Correo electrónico').fill(USUARIOS.empleado.correo);
    await page.getByLabel('Contraseña', { exact: true }).fill('Contraseña2026');

    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page.getByRole('alert')).toContainText('El correo o la contraseña son incorrectos.');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('inicia sesión y lleva al empleado a su pantalla de inicio', async ({ page }) => {
    await simularApi(page);

    await iniciarSesion(page, 'empleado');

    await expect(page).toHaveURL(/\/inicio$/);
    await expect(page.getByRole('heading', { name: 'Hola, Luis' })).toBeVisible();
  });

  test('cierra la sesión y vuelve al login', async ({ page }) => {
    await simularApi(page);
    await iniciarSesion(page, 'empleado');
    await expect(page).toHaveURL(/\/inicio$/);

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
  });
});