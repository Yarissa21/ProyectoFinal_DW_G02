import { expect, test, type Page } from '@playwright/test';
import { iniciarSesion, simularApi } from './apiFalsa.ts';

function panel(page: Page, titulo: string) {
  return page.getByRole('article').filter({ has: page.getByRole('heading', { name: titulo }) });
}

test.describe('Navegación protegida', () => {
  test('la administradora tiene acceso permitido en las dos verificaciones', async ({ page }) => {
    await simularApi(page);
    await iniciarSesion(page, 'administradora');

    await page.getByRole('link', { name: 'Estado sistema' }).click();

    await expect(panel(page, 'Acceso administrativo')).toContainText('Acceso permitido (200) como Administrador');
    await expect(panel(page, 'Acceso de recursos humanos')).toContainText('Acceso permitido (200) como Administrador');
  });

  test('la gestora de RRHH recibe 403 en lo administrativo y acceso en lo de RRHH', async ({ page }) => {
    await simularApi(page);
    await iniciarSesion(page, 'gestora');

    await page.getByRole('link', { name: 'Estado sistema' }).click();

    await expect(panel(page, 'Acceso administrativo')).toContainText('Acceso denegado (403)');
    await expect(panel(page, 'Acceso administrativo')).toContainText('Esperado para tu rol: denegado. ✓ Coincide.');
    await expect(panel(page, 'Acceso de recursos humanos')).toContainText('Acceso permitido (200) como Gestor de RRHH');
  });

  test('el empleado recibe 403 en las dos verificaciones', async ({ page }) => {
    await simularApi(page);
    await iniciarSesion(page, 'empleado');

    await page.getByRole('link', { name: 'Estado sistema' }).click();

    await expect(panel(page, 'Acceso administrativo')).toContainText('Acceso denegado (403)');
    await expect(panel(page, 'Acceso de recursos humanos')).toContainText('Acceso denegado (403)');
  });

  test('el empleado no puede entrar a una pantalla administrativa escribiendo la dirección', async ({ page }) => {
    await simularApi(page);
    await iniciarSesion(page, 'empleado');
    await expect(page).toHaveURL(/\/inicio$/);

    await page.goto('/empleados');

    await expect(page.getByRole('heading', { name: 'Acceso restringido' })).toBeVisible();
    await expect(page.getByText('Tu rol no tiene permiso para ver esta sección.')).toBeVisible();
  });
});