import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../Modal';
import FormField from './FormField';
import ServerIssueAlert from './ServerIssueAlert';
import { useCreateUser } from '../../hooks/useUsers';
import { USER_FORM_FIELDS, userSchema, type UserFormValues } from '../../schemas/userSchema';
import type { UserAccount } from '../../types/user';
import { USER_ROLE_LABELS, USER_ROLE_VALUES } from '../../utils/userLabels';
import { resolveServerIssue, type ServerIssue } from '../../utils/formErrors';

export interface UserDefaults {
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface CreateUserDialogProps {
  open: boolean;
  defaults: UserDefaults;
  chooseRole?: boolean;
  onClose: () => void;
  onCreated: (user: UserAccount) => void;
}

interface CreateUserFormProps {
  defaults: UserDefaults;
  chooseRole: boolean;
  onSubmit: (values: UserFormValues) => Promise<UserAccount>;
  onClose: () => void;
  onCreated: (user: UserAccount) => void;
}

function CreateUserForm({ defaults, chooseRole, onSubmit, onClose, onCreated }: CreateUserFormProps) {
  const [issue, setIssue] = useState<ServerIssue | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: defaults.email ?? '',
      firstName: defaults.firstName ?? '',
      lastName: defaults.lastName ?? '',
      password: '',
      roleCode: 'EMPLOYEE',
    },
    mode: 'onTouched',
  });

  const submit = handleSubmit(async (values) => {
    setIssue(null);
    try {
      const user = await onSubmit(values);
      onCreated(user);
    } catch (error) {
      setIssue(
        resolveServerIssue(error, USER_FORM_FIELDS, (field, message, focus) =>
          setError(field, { type: 'server', message }, { shouldFocus: focus }),
        ),
      );
    }
  });

  return (
    <form
      onSubmit={(event) => {
        event.stopPropagation();
        void submit(event);
      }}
      noValidate
      autoComplete="off"
      className="space-y-4"
    >
      {!chooseRole && <p className="text-sm text-slate-700">Se creará una cuenta con rol de empleado.</p>}

      {chooseRole && (
        <FormField id="new-user-role" label="Rol" required error={errors.roleCode?.message}>
          {(control) => (
            <select {...control} {...register('roleCode')}>
              {USER_ROLE_VALUES.map((role) => (
                <option key={role} value={role}>
                  {USER_ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          )}
        </FormField>
      )}

      <FormField id="new-user-email" label="Correo electrónico" required error={errors.email?.message}>
        {(control) => <input type="email" {...control} {...register('email')} />}
      </FormField>
      <FormField id="new-user-firstName" label="Nombre" required error={errors.firstName?.message}>
        {(control) => <input type="text" {...control} {...register('firstName')} />}
      </FormField>
      <FormField id="new-user-lastName" label="Apellido" required error={errors.lastName?.message}>
        {(control) => <input type="text" {...control} {...register('lastName')} />}
      </FormField>
      <FormField
        id="new-user-password"
        label="Contraseña inicial"
        required
        hint="Mínimo 10 caracteres. Compártela de forma segura con la persona."
        error={errors.password?.message}
      >
        {(control) => <input type="password" autoComplete="new-password" {...control} {...register('password')} />}
      </FormField>

      {issue && <ServerIssueAlert issue={issue} onRetry={() => void submit()} />}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
        >
          {isSubmitting ? 'Creando…' : 'Crear usuario'}
        </button>
      </div>
    </form>
  );
}

function CreateUserDialog({ open, defaults, chooseRole = false, onClose, onCreated }: CreateUserDialogProps) {
  const mutation = useCreateUser();

  return (
    <Modal open={open} title="Crear usuario" onClose={onClose} locked={mutation.isPending}>
      <CreateUserForm
        defaults={defaults}
        chooseRole={chooseRole}
        onSubmit={(values) => mutation.mutateAsync({ ...values, roleCode: chooseRole ? values.roleCode : 'EMPLOYEE' })}
        onClose={onClose}
        onCreated={onCreated}
      />
    </Modal>
  );
}

export default CreateUserDialog;