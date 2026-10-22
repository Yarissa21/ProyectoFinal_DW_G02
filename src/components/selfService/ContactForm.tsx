import { useState } from 'react';
import { useTimedNotice } from '../../hooks/useTimedNotice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormField from '../employees/FormField';
import ServerIssueAlert from '../employees/ServerIssueAlert';
import { useUpdateMyContact } from '../../hooks/useSelfService';
import {
  ADDRESS_MAX_LENGTH,
  CONTACT_FORM_FIELDS,
  PHONE_MAX_LENGTH,
  contactSchema,
  type ContactFormValues,
} from '../../schemas/contactSchema';
import type { SelfServiceProfile, UpdateSelfServiceContactPayload } from '../../types/selfService';
import { resolveServerIssue, type ServerIssue } from '../../utils/formErrors';

interface Notice {
  tone: 'success' | 'info';
  text: string;
}

function ContactForm({ profile }: { profile: SelfServiceProfile }) {
  const mutation = useUpdateMyContact();
  const [issue, setIssue] = useState<ServerIssue | null>(null);
  const [notice, setNotice] = useTimedNotice<Notice>();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { address: profile.address, phone: profile.phone ?? '' },
    mode: 'onTouched',
  });

  const submit = handleSubmit(async (values) => {
    setIssue(null);
    setNotice(null);

    const payload: UpdateSelfServiceContactPayload = {};
    if (values.address !== profile.address) payload.address = values.address;
    if (values.phone !== (profile.phone ?? '')) payload.phone = values.phone;

    if (Object.keys(payload).length === 0) {
      setNotice({ tone: 'info', text: 'No hay cambios para guardar.' });
      return;
    }

    try {
      const updated = await mutation.mutateAsync(payload);
      reset({ address: updated.address, phone: updated.phone ?? '' });
      setNotice({ tone: 'success', text: 'Tus datos de contacto se actualizaron correctamente.' });
    } catch (error) {
      setIssue(
        resolveServerIssue(error, CONTACT_FORM_FIELDS, (field, message, focus) =>
          setError(field, { type: 'server', message }, { shouldFocus: focus }),
        ),
      );
    }
  });

  return (
    <section aria-labelledby="contact-title" className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 id="contact-title" className="flex items-center gap-2 text-base font-semibold text-slate-900">
        <span aria-hidden="true" className="h-5 w-1 rounded-full bg-amber-400" />
        Mis datos de contacto
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Puedes actualizar tu dirección y tu teléfono. El resto de tus datos los gestiona Recursos Humanos.
      </p>

      <form onSubmit={submit} noValidate autoComplete="off" className="mt-4 space-y-4">
        <FormField
          id="contact-address"
          label="Dirección"
          required
          hint={`Máximo ${ADDRESS_MAX_LENGTH} caracteres.`}
          error={errors.address?.message}
        >
          {(control) => <textarea rows={3} {...control} {...register('address')} />}
        </FormField>

        <FormField
          id="contact-phone"
          label="Teléfono"
          hint={`Opcional. Máximo ${PHONE_MAX_LENGTH} caracteres.`}
          error={errors.phone?.message}
        >
          {(control) => <input type="tel" {...control} {...register('phone')} />}
        </FormField>

        {issue && <ServerIssueAlert issue={issue} onRetry={() => void submit()} />}

        {notice && (
          <p
            role="status"
            className={
              notice.tone === 'success'
                ? 'rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900'
                : 'rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800'
            }
          >
            {notice.text}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
          >
            {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ContactForm;
