import { expect, test } from '@playwright/test';
import { iniciarSesion, simularApi } from './apiFalsa.ts';

test.describe('Dashboard administrativo', () => {
  for (const perfil of ['administradora', 'gestora'] as const) {
    test(`muestra los indicadores a ${perfil === 'administradora' ? 'la administradora' : 'la gestora de RRHH'}`, async ({ page }) => {
      await simularApi(page);

      await iniciarSesion(page, perfil);

      await expect(page).toHaveURL(/\/dashboard$/);
      await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
      const personal = page.getByRole('region', { name: 'Personal' });
      await expect(personal).toContainText('Total de empleados');
      await expect(personal).toContainText('12');
      await expect(page.getByRole('region', { name: 'Expedientes' })).toContainText('58.33');
      await expect(page.getByText('Nómina quincenal octubre 2026')).toBeVisible();
    });
  }
});