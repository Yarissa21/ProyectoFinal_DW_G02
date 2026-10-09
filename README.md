# Proyecto Final Desarrollo Web — Sistema de RRHH (Grupo G02)

Universidad Mariano Gálvez de Guatemala · Curso 036 Desarrollo Web · Centro Universitario Chiquimulilla

Frontend (SPA) que consume la instancia **api-g02** de API-RH. Incluye el núcleo común del proyecto y la especialización de G02: ciclo de vida y desarrollo (empleados y antecedentes académicos).

## Versión publicada

**https://proyectofinal-dw-g02.netlify.app/**

## Stack

React 18 · Vite · TypeScript · React Router · TanStack Query · Zustand · react-hook-form + Zod · TailwindCSS · Axios

## Instalación

Requisitos: Node.js 18 o superior y npm.

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

`.env.example` solo contiene un placeholder. El archivo `.env` se crea en el proyecto con la url de la api real.

## Comandos

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Sirve la build localmente |
| `npm run lint` | Análisis con ESLint |

## Cómo probar cada rol

Se inicia sesión con las cuentas que estan disponibles y según su rol muestran lo siguiente:

**ADMIN**
- Dashboard administrativo.
- Crear, listar, ver y editar empleados.
- Cambiar estado laboral y consultar el historial laboral (solo lectura).
- Registrar, editar y eliminar antecedentes académicos.
- Dar de baja a un empleado (solo ADMIN puede).
- Consultar los reportes de resumen de empleados y consolidado académico.

**HR_MANAGER**
- Mismo flujo que ADMIN.
- Al intentar dar de baja a un empleado se muestra un mensaje de 403, porque esa acción es exclusiva de ADMIN (No deberia de verse el botón de dar de baja).

**EMPLOYEE**
- Pantalla de inicio con su propio perfil y edición de contacto.
- Consulta de sus antecedentes académicos.
- No tiene acceso al dashboard ni al listado de empleados (403).
- Si no tiene perfil vinculado, ve un mensaje claro (`EMPLOYEE_PROFILE_NOT_LINKED`).