import { expect, test } from '@playwright/test';
import { iniciarSesion, simularApi } from './apiFalsa.ts';

test.describe('Errores de negocio', () => {
  test('marca el DPI y el correo cuando el empleado ya existe (409)', async ({ page }) => {
    const api = await simularApi(page);
    await iniciarSesion(page, 'administradora');
    api.fallarProxima('POST', '/employees', 409, 'EMPLOYEE_UNIQUE_CONSTRAINT', 'Employee already exists');
    await page.goto('/empleados/nuevo');
    await page.getByLabel('Primer nombre').fill('Marcela');
    await page.getByLabel('Primer apellido').fill('Tzoc');
    await page.getByLabel('DPI').fill('2733150920101');
    await page.getByLabel('Fecha de nacimiento').fill('1994-02-18');
    await page.getByLabel('Correo electrónico').fill('marcela.tzoc@example.com');
    await page.getByLabel('Dirección').fill('2a avenida 5-30, zona 1, Chiquimulilla');
    await page.getByLabel('Departamento').selectOption('depto-contabilidad');
    await page.getByLabel('Puesto').selectOption('puesto-contador');
    await page.getByLabel('Salario base').fill('9000.00');
    await page.getByLabel('Fecha de ingreso').fill('2026-10-05');

    await page.getByRole('button', { name: 'Registrar empleado' }).click();

    await expect(page.getByText('Este DPI o correo ya está registrado en otro empleado.').first()).toBeVisible();
    await expect(page).toHaveURL(/\/empleados\/nuevo$/);
  });

  test('muestra mensaje, código e identificador cuando el puesto no corresponde al departamento (422)', async ({ page }) => {
    const api = await simularApi(page);
    await iniciarSesion(page, 'administradora');
    api.fallarProxima(
      'POST',
      '/employees',
      422,
      'POSITION_NOT_IN_DEPARTMENT',
      'El puesto elegido no está habilitado en el departamento seleccionado.',
    );
    await page.goto('/empleados/nuevo');
    await page.getByLabel('Primer nombre').fill('Gabriela');
    await page.getByLabel('Primer apellido').fill('Sicán');
    await page.getByLabel('DPI').fill('2845219630101');
    await page.getByLabel('Fecha de nacimiento').fill('1993-11-30');
    await page.getByLabel('Correo electrónico').fill('gabriela.sican@example.com');
    await page.getByLabel('Dirección').fill('6a avenida 8-14, zona 3, Chiquimulilla');
    await page.getByLabel('Departamento').selectOption('depto-ti');
    await page.getByLabel('Puesto').selectOption('puesto-soporte');
    await page.getByLabel('Salario base').fill('7000.00');
    await page.getByLabel('Fecha de ingreso').fill('2026-10-12');

    await page.getByRole('button', { name: 'Registrar empleado' }).click();

    const alerta = page.getByRole('alert');
    await expect(alerta).toContainText('El puesto elegido no está habilitado en el departamento seleccionado.');
    await alerta.getByText('Detalles técnicos').click();
    await expect(alerta).toContainText('422');
    await expect(alerta).toContainText('POSITION_NOT_IN_DEPARTMENT');
    await expect(alerta).toContainText('req-7f3a9c21-4b8e-42d1');
    await expect(page).toHaveURL(/\/empleados\/nuevo$/);
  });

  test('ofrece reintentar cuando el servicio no está disponible (503)', async ({ page }) => {
    const api = await simularApi(page);
    await iniciarSesion(page, 'administradora');
    api.fallarProxima('GET', '/employees', 503, 'SERVICE_UNAVAILABLE', 'Service unavailable', 2);

    await page.getByRole('link', { name: 'Empleados' }).first().click();

    const alerta = page.getByRole('alert');
    await expect(alerta).toContainText('El servicio no está disponible temporalmente. Inténtalo de nuevo en unos momentos.');
    await alerta.getByText('Detalles técnicos').click();
    await expect(alerta).toContainText('503');
    await expect(alerta).toContainText('req-7f3a9c21-4b8e-42d1');

    await alerta.getByRole('button', { name: 'Reintentar' }).click();

    await expect(page.getByText('12 empleados encontrados')).toBeVisible();
  });
});