import { ApiError } from './http';

const MESSAGE_BY_CODE: Record<string, string> = {
  INVALID_CREDENTIALS: 'El correo o la contraseña son incorrectos.',
  EMPLOYEE_PROFILE_NOT_LINKED:
    'Tu cuenta aún no está vinculada a un perfil de empleado. Contacta al responsable.',
  EMPLOYEE_UNIQUE_CONSTRAINT: 'Ya existe un empleado con ese DPI o correo electrónico.',
};

const MESSAGE_BY_STATUS: Record<number, string> = {
  0: 'No fue posible comunicarse con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  400: 'Los datos enviados no son válidos. Revisa el formulario.',
  401: 'Tu sesión no es válida o venció. Inicia sesión de nuevo.',
  403: 'Tu rol no tiene permiso para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  409: 'La operación entra en conflicto con el estado actual de los datos.',
  422: 'La operación no cumple una regla de negocio.',
  429: 'Demasiadas solicitudes. Espera un minuto e inténtalo de nuevo.',
  500: 'Ocurrió un error interno. Inténtalo de nuevo en unos momentos.',
  503: 'El servicio no está disponible temporalmente. Inténtalo de nuevo en unos momentos.',
};

const FIXED_MESSAGE_STATUSES = new Set([0, 401, 403, 404, 429, 500, 503]);
const RETRYABLE_STATUSES = new Set([0, 500, 503]);

export interface ErrorDescription {
  message: string;
  retryable: boolean;
  status?: number;
  code?: string;
  requestId?: string;
  method?: string;
  path?: string;
  timestamp?: string;
}

function resolveMessage(error: ApiError): string {
  const byCode = MESSAGE_BY_CODE[error.code];
  if (byCode) return byCode;

  const byStatus = MESSAGE_BY_STATUS[error.status];
  if (FIXED_MESSAGE_STATUSES.has(error.status) && byStatus) return byStatus;

  const backendMessage = error.message.trim();
  if (backendMessage && error.code !== 'UNKNOWN_ERROR') return backendMessage;

  return byStatus ?? 'Ocurrió un error inesperado.';
}

export function describeError(error: unknown): ErrorDescription {
  if (error instanceof ApiError) {
    return {
      message: resolveMessage(error),
      retryable: RETRYABLE_STATUSES.has(error.status),
      status: error.status,
      code: error.code,
      requestId: error.requestId,
      method: error.method,
      path: error.path,
      timestamp: error.timestamp,
    };
  }
  return { message: 'Ocurrió un error inesperado.', retryable: false };
}