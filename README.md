# Proyecto Final Desarrollo Web — Sistema de RRHH (Grupo 3 - G02)

Universidad Mariano Gálvez de Guatemala · Curso: Desarrollo Web · Centro Universitario Chiquimulilla

Frontend (SPA) que consume la instancia **api-g02** de API-RH. Incluye el núcleo común del proyecto y la especialización de G02: ciclo de vida y desarrollo (empleados y antecedentes académicos).

## Versión publicada

**https://proyectofinal-dw-g02.netlify.app/**

## Stack

React 19 · TypeScript 6 · Vite 8 · React Router 7 · TanStack Query 5 · Zustand 5 · react-hook-form + Zod · Tailwind CSS 4 · Axios · react-hot-toast

Pruebas: Vitest, React Testing Library, msw y Playwright.

## Instalación

Requisitos: Node.js 22.12 o superior y npm.

```bash
git clone https://github.com/Yarissa21/ProyectoFinal_DW_G02.git
cd ProyectoFinal_DW_G02
npm install
cp .env.example .env    # en Windows: copy .env.example .env
npm run dev
```

La aplicación se abre en http://localhost:5173.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_BASE_URL` | URL base de la instancia asignada (api-g02) |

`.env.example` solo contiene un placeholder. El archivo `.env` se crea en el proyecto con la URL de la API real y no se sube al repositorio.

## Comandos

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Sirve la build localmente |
| `npm run lint` | Análisis con ESLint |
| `npm test` | Pruebas unitarias y de componentes (Vitest) |
| `npm run test:ui` | Vitest con interfaz gráfica |
| `npx playwright install chromium` | Instala el navegador para las pruebas de recorridos (solo la primera vez) |
| `npm run test:pruebas-automatizadas` | Pruebas de recorridos completos (Playwright, Chromium) |
| `npm run test:pruebas-automatizadas:ui` | Playwright con interfaz gráfica |

Las pruebas automatizadas usan una API simulada y datos ficticios; no necesitan credenciales ni se conectan a la API real.

## Cómo probar cada rol

Se inicia sesión con las cuentas que están disponibles y, según su rol, se muestra lo siguiente:

**ADMIN**
- Dashboard administrativo.
- Crear, listar, ver y editar empleados.
- Cambiar estado laboral y consultar el historial laboral (solo lectura).
- Registrar, editar y eliminar antecedentes académicos.
- Dar de baja a un empleado (acción exclusiva de ADMIN).
- Consultar los reportes de resumen de empleados y consolidado académico, y exportarlos a PDF.
- Administrar usuarios, sedes, departamentos, puestos y tipos de documento.
- Subir, descargar y eliminar documentos del expediente.

**HR_MANAGER**
- Mismo flujo que ADMIN en empleados, antecedentes académicos, documentos y reportes.
- No ve el botón Dar de baja (acción exclusiva de ADMIN).
- Empresa y Tipos de documento son de solo lectura: no aparecen las acciones de crear, editar ni activar.
- No tiene acceso a Usuarios.

**EMPLOYEE**
- Pantalla de inicio con su propio perfil y edición de contacto.
- Consulta de sus antecedentes académicos y de sus documentos, con descarga.
- No tiene acceso al dashboard ni al listado de empleados (Pantalla de acceso restringido).
- Si no tiene perfil vinculado, ve un mensaje claro (De que el perfil no está vinculado todavía).
