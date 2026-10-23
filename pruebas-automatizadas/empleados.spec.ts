import { expect, test } from '@playwright/test';
import { iniciarSesion, simularApi } from './apiFalsa.ts';

test.describe('Listado y detalle de empleados', () => {
  test('muestra la primera página y permite pasar a la siguiente', async ({ page }) => {
    await simularApi(page);
    await iniciarSesion(page, 'administradora');
    await page.getByRole('link', { name: 'Empleados' }).first().click();

    await expect(page.getByText('12 empleados encontrados')).toBeVisible();
    await expect(page.getByText('Mostrando 1–5 de 12')).toBeVisible();
    await expect(page.getByRole('link', { name: 'María Fernanda López Ruiz', exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Siguiente' }).click();

    await expect(page.getByText('Mostrando 6–10 de 12')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Pedro Antonio García Soto', exact: true })).toBeVisible();
  });

  test('busca empleados por nombre', async ({ page }) => {
    await simularApi(page);
    await iniciarSesion(page, 'gestora');
    await page.goto('/empleados');

    await page.getByLabel('Buscar por nombre').fill('Hernández');

    await expect(page.getByText('1 empleado encontrado')).toBeVisible();
    await expect(page.getByRole('link', { name: 'José Luis Hernández Castillo', exact: true })).toBeVisible();
  });

  test('filtra empleados por estado laboral', async ({ page }) => {
    await simularApi(page);
    await iniciarSesion(page, 'gestora');
    await page.goto('/empleados');

    await page.getByLabel('Estado laboral').selectOption('SUSPENDED');

    await expect(page.getByText('1 empleado encontrado')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ana Lucía Morales Cruz', exact: true })).toBeVisible();
  });

  test('avisa cuando ningún empleado coincide con la búsqueda', async ({ page }) => {
    await simularApi(page);
    await iniciarSesion(page, 'administradora');
    await page.goto('/empleados');

    await page.getByLabel('Buscar por nombre').fill('Zacarías');

    await expect(page.getByText('Ningún empleado coincide con la búsqueda.')).toBeVisible();
  });

  test('abre el detalle de un empleado con sus datos', async ({ page }) => {
    await simularApi(page);
    await iniciarSesion(page, 'administradora');
    await page.goto('/empleados');

    await page.getByRole('link', { name: 'María Fernanda López Ruiz', exact: true }).click();

    await expect(page.getByRole('heading', { level: 1, name: 'María Fernanda López Ruiz' })).toBeVisible();
    await expect(page.getByText('2547839210101')).toBeVisible();
    await expect(page.getByText('maria.lopez@example.com')).toBeVisible();
    await expect(page.getByText('Ventas', { exact: true })).toBeVisible();
  });
});