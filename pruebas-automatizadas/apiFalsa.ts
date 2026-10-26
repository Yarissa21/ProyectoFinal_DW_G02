import type { Page } from '@playwright/test';

export const CLAVE_TOKEN = 'rh.refreshToken';

export const USUARIOS = {
  administradora: {
    correo: 'ana@ejemplo.test',
    clave: 'Clave12345',
    nombre: 'Ana Prueba',
    datos: { id: 'usuario-1', email: 'ana@ejemplo.test', firstName: 'Ana', lastName: 'Prueba', isActive: true, role: { code: 'ADMIN', name: 'Administrador' } },
  },
  empleado: {
    correo: 'luis@ejemplo.test',
    clave: 'Clave12345',
    nombre: 'Luis Ejemplo',
    datos: { id: 'usuario-2', email: 'luis@ejemplo.test', firstName: 'Luis', lastName: 'Ejemplo', isActive: true, role: { code: 'EMPLOYEE', name: 'Empleado' } },
  },
  gestora: {
    correo: 'sofia.ramirez@example.com',
    clave: 'Clave12345',
    nombre: 'Sofía Ramírez',
    datos: { id: 'usuario-3', email: 'sofia.ramirez@example.com', firstName: 'Sofía', lastName: 'Ramírez', isActive: true, role: { code: 'HR_MANAGER', name: 'Gestor de RRHH' } },
  },
};

type Perfil = keyof typeof USUARIOS;

interface ErrorForzado {
  metodo: string;
  ruta: string;
  status: number;
  code: string;
  mensaje: string;
  veces: number;
}

interface EmpleadoFalso {
  id: string;
  dpi: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  secondLastName: string | null;
  birthDate: string;
  address: string;
  phone: string | null;
  email: string | null;
  baseSalary: string;
  hireDate: string;
  terminationDate: string | null;
  status: string;
  recordStatus: string;
  department: { id: string; code: string; name: string };
  position: { id: string; code: string; name: string };
  user: null;
  createdAt: string;
  updatedAt: string;
}

const DEPARTAMENTOS = [
  { id: 'depto-ventas', code: 'VENTAS', name: 'Ventas' },
  { id: 'depto-contabilidad', code: 'CONTABILIDAD', name: 'Contabilidad' },
  { id: 'depto-ti', code: 'TI', name: 'Tecnología de la Información' },
  { id: 'depto-rrhh', code: 'RRHH', name: 'Recursos Humanos' },
];

const PUESTOS = [
  { id: 'puesto-vendedor', code: 'VENDEDOR', name: 'Vendedor', departmentIds: ['depto-ventas'] },
  { id: 'puesto-supervisor', code: 'SUPERVISOR', name: 'Supervisor de ventas', departmentIds: ['depto-ventas'] },
  { id: 'puesto-contador', code: 'CONTADOR', name: 'Contador', departmentIds: ['depto-contabilidad'] },
  { id: 'puesto-auxiliar', code: 'AUXILIAR', name: 'Auxiliar contable', departmentIds: ['depto-contabilidad'] },
  { id: 'puesto-desarrollador', code: 'DESARROLLADOR', name: 'Desarrollador de Software', departmentIds: ['depto-ti'] },
  { id: 'puesto-soporte', code: 'SOPORTE', name: 'Soporte técnico', departmentIds: ['depto-ti'] },
  { id: 'puesto-gestor', code: 'GESTOR', name: 'Gestor de RRHH', departmentIds: ['depto-rrhh'] },
];

const PERSONAL: Array<[string, string, string, string, string, string, string, string, string, string]> = [
  ['María', 'Fernanda', 'López', 'Ruiz', 'depto-ventas', 'puesto-vendedor', 'ACTIVE', '2024-02-01', '8500.00', '2547839210101'],
  ['Carlos', 'Eduardo', 'Méndez', 'Girón', 'depto-contabilidad', 'puesto-contador', 'ACTIVE', '2023-06-15', '9800.00', '2412903450101'],
  ['Sofía', 'Alejandra', 'Ramírez', 'Pineda', 'depto-rrhh', 'puesto-gestor', 'ACTIVE', '2022-01-10', '10500.00', '2398127640101'],
  ['José', 'Luis', 'Hernández', 'Castillo', 'depto-ti', 'puesto-desarrollador', 'ACTIVE', '2025-03-03', '11200.00', '2654318970101'],
  ['Ana', 'Lucía', 'Morales', 'Cruz', 'depto-ventas', 'puesto-supervisor', 'SUSPENDED', '2021-09-20', '9200.00', '2301874560101'],
  ['Pedro', 'Antonio', 'García', 'Soto', 'depto-ti', 'puesto-soporte', 'ACTIVE', '2024-08-12', '6800.00', '2587416390101'],
  ['Lucía', 'Beatriz', 'Pérez', 'Orellana', 'depto-contabilidad', 'puesto-auxiliar', 'ACTIVE', '2025-01-20', '5900.00', '2689105230101'],
  ['Diego', 'Armando', 'Súchite', 'Lemus', 'depto-ventas', 'puesto-vendedor', 'RETIRED', '2020-05-04', '7600.00', '2245098710101'],
  ['Karla', 'Mariela', 'Estrada', 'Díaz', 'depto-rrhh', 'puesto-gestor', 'ACTIVE', '2023-11-06', '8900.00', '2478560910101'],
  ['Roberto', 'Carlos', 'Aguilar', 'Monzón', 'depto-ti', 'puesto-desarrollador', 'ACTIVE', '2024-10-01', '11800.00', '2536987140101'],
  ['Andrea', 'Paola', 'Cifuentes', 'Vásquez', 'depto-contabilidad', 'puesto-contador', 'ACTIVE', '2022-07-18', '9400.00', '2431679820101'],
  ['Luis', 'Fernando', 'Barrios', 'Tobar', 'depto-ventas', 'puesto-vendedor', 'ACTIVE', '2026-02-09', '8300.00', '2702345680101'],
];

function sinTildes(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function fechaIso(fecha: string) {
  return fecha.length === 10 ? `${fecha}T00:00:00.000Z` : fecha;
}

function crearEmpleado(indice: number, datos: Record<string, string | null | undefined>): EmpleadoFalso {
  const departamento = DEPARTAMENTOS.find((item) => item.id === datos.departmentId) ?? DEPARTAMENTOS[0];
  const puesto = PUESTOS.find((item) => item.id === datos.positionId) ?? PUESTOS[0];
  return {
    id: `empleado-${indice}`,
    dpi: datos.dpi ?? '',
    firstName: datos.firstName ?? '',
    middleName: datos.middleName || null,
    lastName: datos.lastName ?? '',
    secondLastName: datos.secondLastName || null,
    birthDate: fechaIso(datos.birthDate ?? '1990-05-14'),
    address: datos.address ?? '5a avenida 10-25, zona 1, Chiquimula',
    phone: datos.phone || null,
    email: datos.email || null,
    baseSalary: datos.baseSalary ?? '0.00',
    hireDate: fechaIso(datos.hireDate ?? '2024-01-01'),
    terminationDate: datos.status === 'RETIRED' ? '2025-12-31T00:00:00.000Z' : null,
    status: datos.status ?? 'ACTIVE',
    recordStatus: datos.recordStatus ?? 'INCOMPLETE',
    department: { id: departamento.id, code: departamento.code, name: departamento.name },
    position: { id: puesto.id, code: puesto.code, name: puesto.name },
    user: null,
    createdAt: '2026-01-05T15:00:00.000Z',
    updatedAt: '2026-01-05T15:00:00.000Z',
  };
}

function crearEmpleadosIniciales(): EmpleadoFalso[] {
  return PERSONAL.map((fila, indice) => {
    const [firstName, middleName, lastName, secondLastName, departmentId, positionId, status, hireDate, baseSalary, dpi] = fila;
    const correo = `${sinTildes(firstName)}.${sinTildes(lastName)}@example.com`;
    return crearEmpleado(indice + 1, {
      firstName,
      middleName,
      lastName,
      secondLastName,
      departmentId,
      positionId,
      status,
      hireDate,
      baseSalary,
      dpi,
      email: correo,
      phone: '5512-3478',
      recordStatus: 'COMPLETE',
    });
  });
}

function exito(data: unknown) {
  return { success: true, data, timestamp: new Date().toISOString(), path: '/', requestId: 'solicitud-de-prueba' };
}

function paginado(items: unknown[] = [], page = 1, limit = 5) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  return {
    items: items.slice((page - 1) * limit, page * limit),
    meta: { page, limit, totalItems, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
  };
}

function fallo(code: string, message: string, requestId = 'solicitud-de-prueba') {
  return { success: false, error: { code, message }, timestamp: new Date().toISOString(), path: '/', requestId };
}

export async function simularApi(page: Page) {
  const llamadas: Array<{ metodo: string; ruta: string; cuerpo: Record<string, string> | null }> = [];
  const tokensEmitidos = new Map<string, Perfil>();
  const empleados = crearEmpleadosIniciales();
  const historial = new Map<string, Array<Record<string, unknown>>>();
  const erroresForzados: ErrorForzado[] = [];
  let tokenVigente: string | null = null;
  let perfilActual: Perfil | null = null;
  let contador = 0;

  const crearSesion = (perfil: Perfil) => {
    contador += 1;
    const refreshToken = `token-de-renovacion-${contador}`;
    tokensEmitidos.set(refreshToken, perfil);
    tokenVigente = refreshToken;
    perfilActual = perfil;
    return {
      user: USUARIOS[perfil].datos,
      tokens: { accessToken: `token-de-acceso-${contador}`, refreshToken, tokenType: 'Bearer', expiresIn: 900, refreshExpiresIn: 604800 },
    };
  };

  const entradasDe = (empleado: EmpleadoFalso) => {
    if (!historial.has(empleado.id)) {
      historial.set(empleado.id, [
        {
          id: `${empleado.id}-alta`,
          eventType: 'HIRED',
          effectiveAt: empleado.hireDate,
          status: 'ACTIVE',
          department: empleado.department,
          position: empleado.position,
          baseSalary: empleado.baseSalary,
          hireDate: empleado.hireDate,
          terminationDate: null,
          changedBy: { id: 'usuario-1', email: 'ana@ejemplo.test' },
          createdAt: empleado.createdAt,
        },
      ]);
    }
    return historial.get(empleado.id) ?? [];
  };

  await page.route('**/api/v1/**', async (route) => {
    const peticion = route.request();
    const url = new URL(peticion.url());
    const ruta = url.pathname.replace('/api/v1', '');
    const parametros = url.searchParams;
    const cuerpo = peticion.postDataJSON() as Record<string, string> | null;
    const metodo = peticion.method();
    llamadas.push({ metodo, ruta, cuerpo });

    const responder = (status: number, json: unknown) => route.fulfill({ status, json });

    const forzado = erroresForzados.find((item) => item.metodo === metodo && item.ruta === ruta && item.veces > 0);
    if (forzado) {
      forzado.veces -= 1;
      return responder(forzado.status, fallo(forzado.code, forzado.mensaje, 'req-7f3a9c21-4b8e-42d1'));
    }

    if (ruta === '/auth/login') {
      const perfil = (Object.keys(USUARIOS) as Perfil[]).find(
        (clave) => USUARIOS[clave].correo === cuerpo?.email && USUARIOS[clave].clave === cuerpo?.password,
      );
      if (!perfil) return responder(401, fallo('INVALID_CREDENTIALS', 'Credenciales inválidas'));
      return responder(201, exito(crearSesion(perfil)));
    }

    if (ruta === '/auth/refresh') {
      const perfil = tokensEmitidos.get(cuerpo?.refreshToken ?? '');
      if (!perfil || cuerpo?.refreshToken !== tokenVigente) {
        return responder(401, fallo('INVALID_REFRESH_TOKEN', 'Token inválido'));
      }
      return responder(200, exito(crearSesion(perfil)));
    }

    if (ruta === '/auth/logout') {
      tokenVigente = null;
      return responder(200, exito({}));
    }

    const rolActual = perfilActual ? USUARIOS[perfilActual].datos.role.code : null;

    if (ruta === '/employees' && metodo === 'POST') {
      const repetido = empleados.some((item) => item.dpi === cuerpo?.dpi || (cuerpo?.email && item.email === cuerpo.email));
      if (repetido) {
        return responder(409, fallo('EMPLOYEE_UNIQUE_CONSTRAINT', 'Employee already exists', 'req-7f3a9c21-4b8e-42d1'));
      }
      const nuevo = crearEmpleado(empleados.length + 1, { ...cuerpo, status: 'ACTIVE' });
      empleados.push(nuevo);
      return responder(201, exito(nuevo));
    }

    const estado = ruta.match(/^\/employees\/([^/]+)\/status$/);
    if (estado && metodo === 'PATCH') {
      const empleado = empleados.find((item) => item.id === estado[1]);
      if (!empleado) return responder(404, fallo('EMPLOYEE_NOT_FOUND', 'No encontrado'));
      empleado.status = cuerpo?.status ?? empleado.status;
      empleado.terminationDate = cuerpo?.terminationDate ? fechaIso(cuerpo.terminationDate) : null;
      entradasDe(empleado).unshift({
        id: `${empleado.id}-estado-${entradasDe(empleado).length}`,
        eventType: 'STATUS_CHANGED',
        effectiveAt: new Date().toISOString(),
        status: empleado.status,
        department: empleado.department,
        position: empleado.position,
        baseSalary: empleado.baseSalary,
        hireDate: empleado.hireDate,
        terminationDate: empleado.terminationDate,
        changedBy: { id: 'usuario-1', email: 'ana@ejemplo.test' },
        createdAt: new Date().toISOString(),
      });
      return responder(200, exito(empleado));
    }

    if (metodo !== 'GET') return responder(404, fallo('NOT_FOUND', 'No encontrado'));

    const instancia = { groupId: 'G02', serviceName: 'api-rh', revision: 'ejemplo' };
    const ahora = new Date().toISOString();

    if (ruta === '/self-service/profile') {
      return responder(
        200,
        exito({
          employeeId: 'empleado-1',
          userId: 'usuario-2',
          dpi: '2547839210101',
          firstName: 'Luis',
          middleName: null,
          lastName: 'Ejemplo',
          secondLastName: null,
          birthDate: '1995-03-12',
          address: '5a avenida 10-25, zona 1, Chiquimula',
          phone: '5512-3478',
          email: 'luis@ejemplo.test',
          baseSalary: '6500.00',
          hireDate: '2025-08-15',
          terminationDate: null,
          status: 'ACTIVE',
          recordStatus: 'IN_PROGRESS',
          department: {
            id: 'depto-ti',
            code: 'TI',
            name: 'Tecnología de la Información',
            branch: { id: 'sede-1', code: 'CENTRAL', name: 'Sede Central' },
          },
          position: { id: 'puesto-1', code: 'DEV', name: 'Desarrollador de Software' },
          updatedAt: ahora,
        }),
      );
    }

    if (ruta === '/health' || ruta === '/health/ready') {
      return responder(
        200,
        exito({ status: 'ok', service: 'api-rh', instance: instancia, dependencies: { database: 'up' }, timestamp: ahora }),
      );
    }

    if (ruta === '/health/live') {
      return responder(200, exito({ status: 'ok', service: 'api-rh', instance: instancia, timestamp: ahora }));
    }

    if (ruta === '/auth/permissions/admin' || ruta === '/auth/permissions/hr') {
      const rolesPermitidos = ruta.endsWith('/admin') ? ['ADMIN'] : ['ADMIN', 'HR_MANAGER'];
      if (!rolActual || !rolesPermitidos.includes(rolActual)) {
        return responder(403, fallo('INSUFFICIENT_ROLE', 'Rol insuficiente'));
      }
      return responder(200, exito(perfilActual ? USUARIOS[perfilActual].datos : null));
    }

    if (ruta === '/employee-catalogs') return responder(200, exito({ departments: DEPARTAMENTOS, positions: PUESTOS }));

    if (ruta === '/reports/dashboard') {
      const contar = (estadoLaboral: string) => empleados.filter((item) => item.status === estadoLaboral).length;
      return responder(
        200,
        exito({
          workforce: { total: empleados.length, active: contar('ACTIVE'), suspended: contar('SUSPENDED'), retired: contar('RETIRED') },
          records: { complete: 7, inProgress: 3, incomplete: 2, compliancePercentage: '58.33' },
          leaveRequests: { pending: 2, upcomingApproved: 1 },
          documents: { expired: 3, expiringNext30Days: 4 },
          latestPayrollPeriod: {
            id: 'periodo-1',
            name: 'Nómina quincenal octubre 2026',
            status: 'CALCULATED',
            paymentDate: '2026-10-30T00:00:00.000Z',
            employeeCount: 10,
          },
          generatedAt: ahora,
        }),
      );
    }

    if (ruta === '/employees') {
      const busqueda = sinTildes(parametros.get('search') ?? '');
      const pagina = Number(parametros.get('page') ?? 1);
      const limite = Number(parametros.get('limit') ?? 5);
      let lista = empleados.filter((item) => {
        const texto = sinTildes(`${item.firstName} ${item.middleName ?? ''} ${item.lastName} ${item.secondLastName ?? ''} ${item.dpi}`);
        if (busqueda && !texto.includes(busqueda)) return false;
        if (parametros.get('status') && item.status !== parametros.get('status')) return false;
        if (parametros.get('departmentId') && item.department.id !== parametros.get('departmentId')) return false;
        if (parametros.get('positionId') && item.position.id !== parametros.get('positionId')) return false;
        return true;
      });
      const campo = parametros.get('sortBy');
      if (campo === 'lastName' || campo === 'hireDate') {
        const factor = parametros.get('sortOrder') === 'desc' ? -1 : 1;
        lista = [...lista].sort((a, b) => String(a[campo]).localeCompare(String(b[campo])) * factor);
      }
      return responder(200, exito(paginado(lista, pagina, limite)));
    }

    const historia = ruta.match(/^\/employees\/([^/]+)\/employment-history$/);
    if (historia) {
      const empleado = empleados.find((item) => item.id === historia[1]);
      return responder(200, exito(paginado(empleado ? entradasDe(empleado) : [], 1, 10)));
    }

    const detalle = ruta.match(/^\/employees\/([^/]+)$/);
    if (detalle) {
      const empleado = empleados.find((item) => item.id === detalle[1]);
      if (!empleado) return responder(404, fallo('EMPLOYEE_NOT_FOUND', 'No encontrado'));
      return responder(200, exito(empleado));
    }

    if (ruta === '/document-types') return responder(200, exito([]));

    const listasVacias = [
      /^\/self-service\/academic-records$/,
      /^\/self-service\/documents$/,
      /^\/employees\/[^/]+\/academic-records$/,
      /^\/employees\/[^/]+\/documents$/,
      /^\/branches$/,
      /^\/departments$/,
      /^\/positions$/,
      /^\/users$/,
    ];
    if (listasVacias.some((patron) => patron.test(ruta))) return responder(200, exito(paginado()));

    return responder(404, fallo('NOT_FOUND', 'No encontrado'));
  });

  return {
    llamadas,
    contar: (metodo: string, ruta: string) =>
      llamadas.filter((llamada) => llamada.metodo === metodo && llamada.ruta === ruta).length,
    tokenVigente: () => tokenVigente,
    fallarProxima: (metodo: string, ruta: string, status: number, code: string, mensaje: string, veces = 1) => {
      erroresForzados.push({ metodo, ruta, status, code, mensaje, veces });
    },
  };
}

export async function iniciarSesion(page: Page, perfil: Perfil) {
  await page.goto('/login');
  await page.getByLabel('Correo electrónico').fill(USUARIOS[perfil].correo);
  await page.getByLabel('Contraseña', { exact: true }).fill(USUARIOS[perfil].clave);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
}