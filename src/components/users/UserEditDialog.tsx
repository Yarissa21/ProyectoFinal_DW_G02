import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormActions from '../organization/FormActions';
import Modal from '../Modal';
import FormField from '../employees/FormField';
import ServerIssueAlert from '../employees/ServerIssueAlert';
import { useUpdateUser } from '../../hooks/useUsers';
import { USER_EDIT_FIELDS, userEditSchema, type UserEditFormValues } from '../../schemas/userSchema';
import type { UpdateUserPayload, UserAccount } from '../../types/user';
import { resolveServerIssue, type ServerIssue } from '../../utils/formErrors';
import { toRoleCode, USER_ROLE_LABELS, USER_ROLE_VALUES } from '../../utils/userLabels';

interface UserEditDialogProps {
  user: UserAccount;
  onClose: () => void;
  onSaved: (message: string) => void;
}

function toFormValues(user: UserAccount): UserEditFormValues {
  return {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roleCode: toRoleCode(user.role.code),
  };
}

function toUpdatePayload(values: UserEditFormValues, user: UserAccount): UpdateUserPayload {
  const original = toFormValues(user);
  const payload: UpdateUserPayload = {};
  if (values.email !== original.email) payload.email = values.email;
  if (values.firstName !== original.firstName) payload.firstName = values.firstName;
  if (values.lastName !== original.lastName) payload.lastName = values.lastName;
  if (values.roleCode !== original.roleCode) payload.roleCode = values.roleCode;
  return payload;
}

function UserEditDialog({ user, onClose, onSaved }: UserEditDialogProps) {
  const update = useUpdateUser(user.id);
  const [issue, setIssue] = useState<ServerIssue | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: toFormValues(user),
    mode: 'onTouched',
  });

  const submit = handleSubmit(async (values) => {
    setIssue(null);
    setInfo(null);
    const payload = toUpdatePayload(values, user);
    if (Object.keys(payload).length === 0) {
      setInfo('No hay cambios para guardar.');
      return;
    }
    try {
      await update.mutateAsync(payload);
      onSaved('Usuario actualizado correctamente.');
    } catch (error) {
      setIssue(
        resolveServerIssue(error, USER_EDIT_FIELDS, (field, message, focus) =>
          setError(field, { type: 'server', message }, { shouldFocus: focus }),
        ),
      );
    }
  });

  return (
    <Modal open title="Editar usuario" onClose={onClose} locked={isSubmitting}>
      <form onSubmit={submit} noValidate autoComplete="off" className="space-y-4">
        <FormField id="edit-user-email" label="Correo electrónico" required error={errors.email?.message}>
          {(control) => <input type="email" {...control} {...register('email')} />}
        </FormField>
        <FormField id="edit-user-firstName" label="Nombre" required error={errors.firstName?.message}>
          {(control) => <input type="text" {...control} {...register('firstName')} />}
        </FormField>
        <FormField id="edit-user-lastName" label="Apellido" required error={errors.lastName?.message}>
          {(control) => <input type="text" {...control} {...register('lastName')} />}
        </FormField>
        <FormField id="edit-user-role" label="Rol" required error={errors.roleCode?.message}>
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

        {issue && <ServerIssueAlert issue={issue} onRetry={() => void submit()} />}
        {info && (
          <p role="status" className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">
            {info}
          </p>
        )}

        <FormActions pending={isSubmitting} label="Guardar cambios" onClose={onClose} />
      </form>
    </Modal>
  );
}

export default UserEditDialog;