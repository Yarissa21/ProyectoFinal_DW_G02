import { useState } from 'react';
import type { ErrorDescription } from '../services/errorMessages';

interface ErrorAlertProps {
  error: ErrorDescription;
  onRetry?: () => void;
  compact?: boolean;
}

function buildReport(error: ErrorDescription): string {
  return [
    `Código: ${error.code ?? 'N/D'}`,
    `Estado HTTP: ${error.status ?? 'N/D'}`,
    `Identificador de solicitud: ${error.requestId ?? 'N/D'}`,
    `Método: ${error.method ?? 'N/D'}`,
    `Ruta: ${error.path ?? 'N/D'}`,
    `Hora: ${error.timestamp ?? 'N/D'}`,
  ].join('\n');
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString('es-GT');
}

function ErrorAlert({ error, onRetry, compact = false }: ErrorAlertProps) {
  const [copied, setCopied] = useState(false);

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(buildReport(error));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const buttonClass =
    'rounded-md border border-red-400 px-3 py-1.5 text-xs font-medium text-red-900 hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-800';

  return (
    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
      <p className="font-semibold">{error.message}</p>

      {!compact && (error.code || error.requestId) && (
        <p className="mt-1 text-xs">
          {error.code && <>Código: {error.code}</>}
          {error.code && error.requestId && ' · '}
          {error.requestId && (
            <>
              ID: <span className="break-all">{error.requestId}</span>
            </>
          )}
        </p>
      )}

      {onRetry && error.retryable && (
        <button type="button" onClick={onRetry} className={`${buttonClass} mt-3`}>
          Reintentar
        </button>
      )}

      <details className="mt-3 text-xs">
        <summary className="cursor-pointer font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-800">
          Detalles técnicos
        </summary>

        <dl className="mt-2 space-y-0.5">
          {error.status !== undefined && (
            <div className="flex gap-1">
              <dt className="font-medium">Estado HTTP:</dt>
              <dd>{error.status === 0 ? 'Sin respuesta' : error.status}</dd>
            </div>
          )}
          {error.code && (
            <div className="flex gap-1">
              <dt className="font-medium">Código:</dt>
              <dd>{error.code}</dd>
            </div>
          )}
          {error.requestId && (
            <div className="flex gap-1">
              <dt className="font-medium">ID de solicitud:</dt>
              <dd className="break-all">{error.requestId}</dd>
            </div>
          )}
          {error.method && error.path && (
            <div className="flex gap-1">
              <dt className="font-medium">Solicitud:</dt>
              <dd className="break-all">
                {error.method} {error.path}
              </dd>
            </div>
          )}
          {error.timestamp && (
            <div className="flex gap-1">
              <dt className="font-medium">Hora:</dt>
              <dd>{formatTime(error.timestamp)}</dd>
            </div>
          )}
        </dl>

        <div className="mt-2 flex items-center gap-2">
          <button type="button" onClick={copyReport} className={buttonClass}>
            Copiar datos para reporte
          </button>
          <span aria-live="polite">{copied ? 'Datos copiados' : ''}</span>
        </div>
      </details>
    </div>
  );
}

export default ErrorAlert;