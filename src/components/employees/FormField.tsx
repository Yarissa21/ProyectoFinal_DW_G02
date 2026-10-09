import type { ReactNode } from 'react';

export interface FieldControlProps {
  id: string;
  className: string;
  'aria-invalid': boolean;
  'aria-required': true | undefined;
  'aria-describedby': string | undefined;
}

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  wide?: boolean;
  children: (props: FieldControlProps) => ReactNode;
}

const baseControlClass =
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-slate-50 disabled:text-slate-500';

function FormField({ id, label, required = false, error, hint, wide = false, children }: FormFieldProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ');

  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-red-700">
            *
          </span>
        )}
      </label>
      {children({
        id,
        className: `${baseControlClass} ${error ? 'border-red-600' : 'border-slate-300'}`,
        'aria-invalid': Boolean(error),
        'aria-required': required ? true : undefined,
        'aria-describedby': describedBy || undefined,
      })}
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;