import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormActions from './FormActions';
import Modal from '../Modal';
import FormField from '../employees/FormField';
import ServerIssueAlert from '../employees/ServerIssueAlert';
import { useCreateBranch, useUpdateBranch } from '../../hooks/useOrganization';
import { BRANCH_FORM_FIELDS, branchSchema, type BranchFormValues } from '../../schemas/organizationSchema';
import type { Branch, CreateBranchPayload, UpdateBranchPayload } from '../../types/organization';
import { resolveServerIssue, type ServerIssue } from '../../utils/formErrors';

interface BranchDialogProps {
  branch?: Branch;
  onClose: () => void;
  onSaved: (message: string) => void;
}

function toFormValues(branch?: Branch): BranchFormValues {
  return {
    code: branch?.code ?? '',
    name: branch?.name ?? '',
    address: branch?.address ?? '',
    phone: branch?.phone ?? '',
    email: branch?.email ?? '',
    isHeadquarters: branch?.isHeadquarters ?? false,
  };
}

function toCreatePayload(values: BranchFormValues): CreateBranchPayload {
  const payload: CreateBranchPayload = { code: values.code, name: values.name, address: values.address };
  if (values.phone) payload.phone = values.phone;
  if (values.email) payload.email = values.email;
  if (values.isHeadquarters) payload.isHeadquarters = true;
  return payload;
}

function toUpdatePayload(values: BranchFormValues, branch: Branch): UpdateBranchPayload {
  const original = toFormValues(branch);
  const payload: UpdateBranchPayload = {};
  if (values.code !== original.code) payload.code = values.code;
  if (values.name !== original.name) payload.name = values.name;
  if (values.address !== original.address) payload.address = values.address;
  if (values.phone !== original.phone && values.phone) payload.phone = values.phone;
  if (values.email !== original.email && values.email) payload.email = values.email;
  if (values.isHeadquarters !== original.isHeadquarters) payload.isHeadquarters = values.isHeadquarters;
  return payload;
}

function BranchDialog({ branch, onClose, onSaved }: BranchDialogProps) {
  const create = useCreateBranch();
  const update = useUpdateBranch(branch?.id ?? '');
  const [issue, setIssue] = useState<ServerIssue | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: toFormValues(branch),
    mode: 'onTouched',
  });

  const submit = handleSubmit(async (values) => {
    setIssue(null);
    setInfo(null);
    try {
      if (branch) {
        const payload = toUpdatePayload(values, branch);
        if (Object.keys(payload).length === 0) {
          setInfo('No hay cambios para guardar.');
          return;
        }
        await update.mutateAsync(payload);
        onSaved('Sede actualizada correctamente.');
      } else {
        await create.mutateAsync(toCreatePayload(values));
        onSaved('Sede creada correctamente.');
      }
    } catch (error) {
      setIssue(
        resolveServerIssue(error, BRANCH_FORM_FIELDS, (field, message, focus) =>
          setError(field, { type: 'server', message }, { shouldFocus: focus }),
        ),
      );
    }
  });

  return (
    <Modal open title={branch ? 'Editar sede' : 'Nueva sede'} onClose={onClose} locked={isSubmitting}>
      <form onSubmit={submit} noValidate autoComplete="off" className="space-y-4">
        <FormField id="branch-code" label="Código" required error={errors.code?.message}>
          {(control) => <input type="text" {...control} {...register('code')} />}
        </FormField>
        <FormField id="branch-name" label="Nombre" required error={errors.name?.message}>
          {(control) => <input type="text" {...control} {...register('name')} />}
        </FormField>
        <FormField id="branch-address" label="Dirección" required error={errors.address?.message}>
          {(control) => <textarea rows={2} {...control} {...register('address')} />}
        </FormField>
        <FormField id="branch-phone" label="Teléfono" error={errors.phone?.message}>
          {(control) => <input type="tel" {...control} {...register('phone')} />}
        </FormField>
        <FormField id="branch-email" label="Correo electrónico" error={errors.email?.message}>
          {(control) => <input type="email" {...control} {...register('email')} />}
        </FormField>
        <label className="flex items-start gap-2 text-sm text-slate-800">
          <input type="checkbox" className="mt-0.5 size-4" {...register('isHeadquarters')} />
          <span>
            Sede principal
            <span className="block text-xs text-slate-600">
              Solo puede haber una sede principal, y no puede perder esa designación ni desactivarse.
            </span>
          </span>
        </label>

        {issue && <ServerIssueAlert issue={issue} onRetry={() => void submit()} />}
        {info && (
          <p role="status" className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">
            {info}
          </p>
        )}

        <FormActions pending={isSubmitting} label={branch ? 'Guardar cambios' : 'Crear sede'} onClose={onClose} />
      </form>
    </Modal>
  );
}

export default BranchDialog;