import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DepartmentPicker from './DepartmentPicker';
import FormActions from './FormActions';
import Modal from '../Modal';
import FormField from '../employees/FormField';
import ServerIssueAlert from '../employees/ServerIssueAlert';
import { useCreatePosition, useUpdatePosition } from '../../hooks/useOrganization';
import { POSITION_FORM_FIELDS, positionSchema, type PositionFormValues } from '../../schemas/organizationSchema';
import type { CreatePositionPayload, Position, UpdatePositionPayload } from '../../types/organization';
import { resolveServerIssue, type ServerIssue } from '../../utils/formErrors';

interface PositionDialogProps {
  position?: Position;
  onClose: () => void;
  onSaved: (message: string) => void;
}

function toFormValues(position?: Position): PositionFormValues {
  return {
    code: position?.code ?? '',
    name: position?.name ?? '',
    departmentIds: position?.departments.map((item) => item.id) ?? [],
    description: position?.description ?? '',
  };
}

function sameIds(a: string[], b: string[]): boolean {
  return a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|');
}

function toCreatePayload(values: PositionFormValues): CreatePositionPayload {
  const payload: CreatePositionPayload = {
    code: values.code,
    name: values.name,
    departmentIds: values.departmentIds,
  };
  if (values.description) payload.description = values.description;
  return payload;
}

function toUpdatePayload(values: PositionFormValues, position: Position): UpdatePositionPayload {
  const original = toFormValues(position);
  const payload: UpdatePositionPayload = {};
  if (values.code !== original.code) payload.code = values.code;
  if (values.name !== original.name) payload.name = values.name;
  if (!sameIds(values.departmentIds, original.departmentIds)) payload.departmentIds = values.departmentIds;
  if (values.description !== original.description && values.description) payload.description = values.description;
  return payload;
}

function PositionDialog({ position, onClose, onSaved }: PositionDialogProps) {
  const create = useCreatePosition();
  const update = useUpdatePosition(position?.id ?? '');
  const [issue, setIssue] = useState<ServerIssue | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PositionFormValues>({
    resolver: zodResolver(positionSchema),
    defaultValues: toFormValues(position),
    mode: 'onTouched',
  });

  const selected = useWatch({ control, name: 'departmentIds' });

  const changeDepartments = (ids: string[]) =>
    setValue('departmentIds', ids, { shouldDirty: true, shouldValidate: true, shouldTouch: true });

  const submit = handleSubmit(async (values) => {
    setIssue(null);
    setInfo(null);
    try {
      if (position) {
        const payload = toUpdatePayload(values, position);
        if (Object.keys(payload).length === 0) {
          setInfo('No hay cambios para guardar.');
          return;
        }
        await update.mutateAsync(payload);
        onSaved('Puesto actualizado correctamente.');
      } else {
        await create.mutateAsync(toCreatePayload(values));
        onSaved('Puesto creado correctamente.');
      }
    } catch (error) {
      setIssue(
        resolveServerIssue(error, POSITION_FORM_FIELDS, (field, message, focus) =>
          setError(field, { type: 'server', message }, { shouldFocus: focus }),
        ),
      );
    }
  });

  return (
    <Modal open title={position ? 'Editar puesto' : 'Nuevo puesto'} onClose={onClose} locked={isSubmitting}>
      <form onSubmit={submit} noValidate autoComplete="off" className="space-y-4">
        <FormField id="pos-code" label="Código" required error={errors.code?.message}>
          {(field) => <input type="text" {...field} {...register('code')} />}
        </FormField>
        <FormField id="pos-name" label="Nombre" required error={errors.name?.message}>
          {(field) => <input type="text" {...field} {...register('name')} />}
        </FormField>
        <FormField id="pos-description" label="Descripción" error={errors.description?.message}>
          {(field) => <textarea rows={2} {...field} {...register('description')} />}
        </FormField>

        <DepartmentPicker
          selected={selected}
          initial={position?.departments ?? []}
          error={errors.departmentIds?.message}
          onChange={changeDepartments}
        />

        {issue && <ServerIssueAlert issue={issue} onRetry={() => void submit()} />}
        {info && (
          <p role="status" className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">
            {info}
          </p>
        )}

        <FormActions pending={isSubmitting} label={position ? 'Guardar cambios' : 'Crear puesto'} onClose={onClose} />
      </form>
    </Modal>
  );
}

export default PositionDialog;