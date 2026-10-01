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
    if (list.length > 0) issues.push({ field, message: list.join(' ') });
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