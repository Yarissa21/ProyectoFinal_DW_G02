import { useState } from 'react';
import type { ErrorDescription } from '../services/errorMessages';

interface ErrorAlertProps {
  error: ErrorDescription;
  onRetry?: () => void;
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

function ErrorAlert({ error, onRetry }: ErrorAlertProps) {
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
      <p className="font-semibold">Error: {error.message}</p>

      <dl className="mt-2 space-y-0.5 text-xs">
        {error.code && (
          <div className="flex gap-1">
            <dt className="font-medium">Código:</dt>
            <dd>{error.code}</dd>
          </div>
        )}
        {error.requestId && (
          <div className="flex gap-1">
            <dt className="font-medium">Identificador de solicitud:</dt>
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

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {onRetry && error.retryable && (
          <button type="button" onClick={onRetry} className={buttonClass}>
            Reintentar
          </button>
        )}
        <button type="button" onClick={copyReport} className={buttonClass}>
          Copiar datos para reporte
        </button>
        <span aria-live="polite" className="text-xs">
          {copied ? 'Datos copiados' : ''}
        </span>
      </div>
    </div>
  );
}

export default ErrorAlert;