import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormActions from './FormActions';
import Modal from '../Modal';
import FormField from '../employees/FormField';
import ServerIssueAlert from '../employees/ServerIssueAlert';
import { useCreatePosition, useDepartments, useUpdatePosition } from '../../hooks/useOrganization';
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
  const departments = useDepartments({ isActive: true, limit: 100 });
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

  const departmentOptions = useMemo(() => {
    const options = (departments.data?.items ?? []).map((item) => ({
      id: item.id,
      label: `${item.name} · ${item.branch.name}`,
    }));
    for (const current of position?.departments ?? []) {
      if (!options.some((item) => item.id === current.id)) {
        options.unshift({ id: current.id, label: `${current.name} (inactivo)` });
      }
    }
    return options;
  }, [departments.data, position]);

  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id];
    setValue('departmentIds', next, { shouldDirty: true, shouldValidate: true, shouldTouch: true });
  };

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

  const departmentsError = errors.departmentIds?.message;

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

        <fieldset aria-describedby={departmentsError ? 'pos-departments-error' : 'pos-departments-hint'}>
          <legend className="mb-1.5 text-sm font-medium text-slate-700">
            Departamentos donde se habilita
            <span aria-hidden="true" className="ml-0.5 text-red-700">
              *
            </span>
          </legend>
          <p id="pos-departments-hint" className="mb-2 text-xs text-slate-600">
            Un puesto debe estar habilitado en al menos un departamento activo.
          </p>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-300 bg-white p-2">
            {departments.isPending && <p className="px-1 py-1 text-sm text-slate-600">Cargando departamentos…</p>}
            {departments.isError && (
              <p className="px-1 py-1 text-sm text-red-700">
                No se pudieron cargar los departamentos. Cierra y vuelve a abrir el formulario.
              </p>
            )}
            {departmentOptions.map((item) => (
              <label key={item.id} className="flex items-center gap-2 rounded px-1 py-1 text-sm text-slate-800 hover:bg-slate-50">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={selected.includes(item.id)}
                  onChange={() => toggle(item.id)}
                />
                {item.label}
              </label>
            ))}
          </div>
          {departmentsError && (
            <p id="pos-departments-error" role="alert" className="mt-1 text-sm text-red-700">
              {departmentsError}
            </p>
          )}
        </fieldset>

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