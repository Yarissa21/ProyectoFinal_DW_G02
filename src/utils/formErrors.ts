import { describeError, type ErrorDescription } from '../services/errorMessages';
import { ApiError } from '../services/http';

export interface FieldIssue {
  field: string;
  message: string;
}

export interface ServerIssue {
  error: ErrorDescription;
  extra: string[];
}

const VALIDATION_RULES: { pattern: RegExp; build: (match: RegExpMatchArray) => string }[] = [
  { pattern: /must be longer than or equal to (\d+) characters?/i, build: (m) => `Debe tener al menos ${m[1]} caracteres.` },
  { pattern: /must be shorter than or equal to (\d+) characters?/i, build: (m) => `No puede superar ${m[1]} caracteres.` },
  { pattern: /must include uppercase, lowercase and number/i, build: () => 'Debe incluir mayúsculas, minúsculas y números.' },
  { pattern: /should not be empty|must not be empty/i, build: () => 'Este campo no puede estar vacío.' },
  { pattern: /must be an email/i, build: () => 'Ingresa un correo válido.' },
  { pattern: /must match .* regular expression/i, build: () => 'El formato no es válido.' },
  { pattern: /must be a valid ISO 8601 date/i, build: () => 'Ingresa una fecha válida.' },
  { pattern: /must be a UUID/i, build: () => 'El identificador no es válido.' },
];

export function translateValidationMessage(message: string): string {
  for (const rule of VALIDATION_RULES) {
    const match = message.match(rule.pattern);
    if (match) return rule.build(match);
  }
  return message;
}

export function extractFieldIssues(details: unknown): FieldIssue[] {
  if (!Array.isArray(details)) return [];

  const issues: FieldIssue[] = [];
  for (const item of details) {
    if (typeof item !== 'object' || item === null) continue;
    const { field, messages, message } = item as { field?: unknown; messages?: unknown; message?: unknown };
    if (typeof field !== 'string') continue;

    const list = Array.isArray(messages)
      ? messages.filter((text): text is string => typeof text === 'string')
      : typeof message === 'string'
        ? [message]
        : [];
    if (list.length > 0) issues.push({ field, message: list.map(translateValidationMessage).join(' ') });
  }
  return issues;
}

export function resolveServerIssue<TField extends string>(
  error: unknown,
  fields: readonly TField[],
  markField: (field: TField, message: string, focus: boolean) => void,
): ServerIssue {
  const description = describeError(error);
  if (!(error instanceof ApiError) || error.status !== 400) return { error: description, extra: [] };

  const extra: string[] = [];
  let focused = false;
  for (const item of extractFieldIssues(error.details)) {
    const field = fields.find((name) => name === item.field);
    if (field) {
      markField(field, item.message, !focused);
      focused = true;
    } else {
      extra.push(`${item.field}: ${item.message}`);
    }
  }

  if (!focused && extra.length === 0) return { error: description, extra };
  return { error: { ...description, message: 'Los datos enviados no son válidos. Revisa lo indicado.' }, extra };
}