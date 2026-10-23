import { expect, test } from '@playwright/test';
import { iniciarSesion, simularApi } from './apiFalsa.ts';

test.describe('Ciclo de vida del empleado', () => {
  test('registra un empleado, cambia su estado y lo ve en el historial', async ({ page }) => {
    await simularApi(page);
    await iniciarSesion(page, 'administradora');
    await page.goto('/empleados/nuevo');

    await page.getByLabel('Primer nombre').fill('Valeria');
    await page.getByLabel('Segundo nombre').fill('Isabel');
    await page.getByLabel('Primer apellido').fill('Castañeda');
    await page.getByLabel('Segundo apellido').fill('Roque');
    await page.getByLabel('DPI').fill('2619084730101');
    await page.getByLabel('Fecha de nacimiento').fill('1996-09-23');
    await page.getByLabel('Teléfono').fill('4125-7788');
    await page.getByLabel('Correo electrónico').fill('valeria.castaneda@example.com');
    await page.getByLabel('Dirección').fill('3a calle 4-12, zona 2, Chiquimulilla');
    await page.getByLabel('Departamento').selectOption('depto-ventas');
    await page.getByLabel('Puesto').selectOption('puesto-vendedor');
    await page.getByLabel('Salario base').fill('8200.00');
    await page.getByLabel('Fecha de ingreso').fill('2026-10-01');

    await page.getByRole('button', { name: 'Registrar empleado' }).click();

    await expect(page).toHaveURL(/\/empleados\/empleado-13$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Valeria Isabel Castañeda Roque' })).toBeVisible();

    await page.getByRole('button', { name: 'Cambiar estado' }).click();
    const dialogo = page.getByRole('dialog', { name: 'Cambiar estado laboral' });
    await dialogo.getByLabel('Nuevo estado').selectOption('SUSPENDED');
    await dialogo.getByRole('button', { name: 'Cambiar estado' }).click();

    await expect(page.getByText('Estado laboral actualizado correctamente.')).toBeVisible();
    await expect(page.getByText('Suspendido').first()).toBeVisible();

    await page.getByRole('tab', { name: 'Historial' }).click();

    await expect(page.getByRole('cell', { name: 'Contratación' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Cambio de estado' })).toBeVisible();
  });
});