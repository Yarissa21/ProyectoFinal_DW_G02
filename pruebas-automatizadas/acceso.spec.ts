import { expect, test } from '@playwright/test';
import { iniciarSesion, simularApi } from './apiFalsa.ts';

test.describe('Acceso según el rol', () => {
  test('el empleado solo ve las secciones de autoservicio en el menú', async ({ page }) => {
    await simularApi(page);

    await iniciarSesion(page, 'empleado');

    const menu = page.getByRole('navigation', { name: 'Principal' });
    await expect(menu.getByRole('link', { name: 'Mi perfil' })).toBeVisible();
    await expect(menu.getByRole('link', { name: 'Empleados' })).toHaveCount(0);
  });

  test('el empleado no puede entrar a la lista de empleados escribiendo la dirección', async ({ page }) => {
    await simularApi(page);
    await iniciarSesion(page, 'empleado');
    await expect(page).toHaveURL(/\/inicio$/);

    await page.goto('/empleados');

    await expect(page.getByRole('heading', { name: 'Acceso restringido' })).toBeVisible();
  });
});