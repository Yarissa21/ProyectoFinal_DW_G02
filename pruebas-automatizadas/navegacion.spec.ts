import { expect, test } from '@playwright/test';
import { USUARIOS, iniciarSesion, simularApi } from './apiFalsa.ts';

const PAGINAS_EMPLEADO = [
  { enlace: 'Mi perfil', ruta: /\/mi-perfil$/, titulo: 'Mi perfil' },
  { enlace: 'Mis académicos', ruta: /\/mis-academicos$/, titulo: 'Mis registros académicos' },
  { enlace: 'Mis documentos', ruta: /\/mis-documentos$/, titulo: 'Mis documentos' },
  { enlace: 'Estado sistema', ruta: /\/sistema$/, titulo: 'Estado del sistema' },
  { enlace: 'Equipo', ruta: /\/equipo$/, titulo: 'Equipo' },
];

const PAGINAS_ADMINISTRADORA = [
  { enlace: 'Empleados', ruta: /\/empleados$/, titulo: 'Empleados' },
  { enlace: 'Empresa', ruta: /\/empresa$/, titulo: 'Empresa' },
  { enlace: 'Tipos documentos', ruta: /\/tipos-documentos$/, titulo: 'Tipos de documento' },
  { enlace: 'Estado sistema', ruta: /\/sistema$/, titulo: 'Estado del sistema' },
  { enlace: 'Equipo', ruta: /\/equipo$/, titulo: 'Equipo' },
  { enlace: 'Dashboard', ruta: /\/dashboard$/, titulo: 'Dashboard' },
];

test.describe('Navegación del empleado', () => {
  test('ve su menú completo y puede entrar a cada página', async ({ page }) => {
    await simularApi(page);

    await iniciarSesion(page, 'empleado');

    await expect(page).toHaveURL(/\/inicio$/);
    const menu = page.getByRole('navigation', { name: 'Principal' });
    await expect(page.getByText(USUARIOS.empleado.nombre)).toBeVisible();
    await expect(page.getByText('Empleado', { exact: true })).toBeVisible();
    await expect(menu.getByRole('link', { name: 'Inicio' })).toBeVisible();
    for (const pagina of PAGINAS_EMPLEADO) {
      await expect(menu.getByRole('link', { name: pagina.enlace })).toBeVisible();
    }
    await expect(menu.getByRole('link', { name: 'Empleados' })).toHaveCount(0);

    for (const pagina of PAGINAS_EMPLEADO) {
      await menu.getByRole('link', { name: pagina.enlace }).click();
      await expect(page).toHaveURL(pagina.ruta);
      await expect(page.getByRole('heading', { level: 1, name: pagina.titulo })).toBeVisible();
    }

    await menu.getByRole('link', { name: 'Inicio' }).click();
    await expect(page).toHaveURL(/\/inicio$/);
  });
});

test.describe('Navegación de la administradora', () => {
  test('ve su menú completo y puede entrar a cada página', async ({ page }) => {
    await simularApi(page);

    await iniciarSesion(page, 'administradora');

    await expect(page).toHaveURL(/\/dashboard$/);
    const menu = page.getByRole('navigation', { name: 'Principal' });
    await expect(page.getByText(USUARIOS.administradora.nombre)).toBeVisible();
    await expect(page.getByText('Administrador', { exact: true })).toBeVisible();
    for (const pagina of PAGINAS_ADMINISTRADORA) {
      await expect(menu.getByRole('link', { name: pagina.enlace })).toBeVisible();
    }
    await expect(menu.getByRole('link', { name: 'Mi perfil' })).toHaveCount(0);

    for (const pagina of PAGINAS_ADMINISTRADORA) {
      await menu.getByRole('link', { name: pagina.enlace }).click();
      await expect(page).toHaveURL(pagina.ruta);
      await expect(page.getByRole('heading', { level: 1, name: pagina.titulo })).toBeVisible();
    }
  });
});