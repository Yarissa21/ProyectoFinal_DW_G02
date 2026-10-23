import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormActions from './FormActions';
import Modal from '../Modal';
import FormField from '../employees/FormField';
import ServerIssueAlert from '../employees/ServerIssueAlert';
import { useBranches, useCreateDepartment, useUpdateDepartment } from '../../hooks/useOrganization';
import {
  DEPARTMENT_FORM_FIELDS,
  departmentSchema,
  type DepartmentFormValues,
} from '../../schemas/organizationSchema';
import type {
  CreateDepartmentPayload,
  Department,
  UpdateDepartmentPayload,
} from '../../types/organization';
import { resolveServerIssue, type ServerIssue } from '../../utils/formErrors';

interface DepartmentDialogProps {
  department?: Department;
  onClose: () => void;
  onSaved: (message: string) => void;
}

function toFormValues(department?: Department): DepartmentFormValues {
  return {
    code: department?.code ?? '',
    name: department?.name ?? '',
    branchId: department?.branch.id ?? '',
    description: department?.description ?? '',
  };
}

function toCreatePayload(values: DepartmentFormValues): CreateDepartmentPayload {
  const payload: CreateDepartmentPayload = { code: values.code, name: values.name, branchId: values.branchId };
  if (values.description) payload.description = values.description;
  return payload;
}

function toUpdatePayload(values: DepartmentFormValues, department: Department): UpdateDepartmentPayload {
  const original = toFormValues(department);
  const payload: UpdateDepartmentPayload = {};
  if (values.code !== original.code) payload.code = values.code;
  if (values.name !== original.name) payload.name = values.name;
  if (values.branchId !== original.branchId) payload.branchId = values.branchId;
  if (values.description !== original.description && values.description) payload.description = values.description;
  return payload;
}

function DepartmentDialog({ department, onClose, onSaved }: DepartmentDialogProps) {
  const create = useCreateDepartment();
  const update = useUpdateDepartment(department?.id ?? '');
  const branches = useBranches({ isActive: true, limit: 100 });
  const [issue, setIssue] = useState<ServerIssue | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: toFormValues(department),
    mode: 'onTouched',
  });

  const branchOptions = useMemo(() => {
    const options = (branches.data?.items ?? []).map((item) => ({ id: item.id, name: `${item.name} (${item.code})` }));
    if (department && !options.some((item) => item.id === department.branch.id)) {
      options.unshift({
        id: department.branch.id,
        name: `${department.branch.name} (${department.branch.code}) (inactiva)`,
      });
    }
    return options;
  }, [branches.data, department]);

  const submit = handleSubmit(async (values) => {
    setIssue(null);
    setInfo(null);
    try {
      if (department) {
        const payload = toUpdatePayload(values, department);
        if (Object.keys(payload).length === 0) {
          setInfo('No hay cambios para guardar.');
          return;
        }
        await update.mutateAsync(payload);
        onSaved('Departamento actualizado correctamente.');
      } else {
        await create.mutateAsync(toCreatePayload(values));
        onSaved('Departamento creado correctamente.');
      }
    } catch (error) {
      setIssue(
        resolveServerIssue(error, DEPARTMENT_FORM_FIELDS, (field, message, focus) =>
          setError(field, { type: 'server', message }, { shouldFocus: focus }),
        ),
      );
    }
  });

  return (
    <Modal
      open
      title={department ? 'Editar departamento' : 'Nuevo departamento'}
      onClose={onClose}
      locked={isSubmitting}
    >
      <form onSubmit={submit} noValidate autoComplete="off" className="space-y-4">
        <FormField id="dept-code" label="Código" required error={errors.code?.message}>
          {(control) => <input type="text" {...control} {...register('code')} />}
        </FormField>
        <FormField id="dept-name" label="Nombre" required error={errors.name?.message}>
          {(control) => <input type="text" {...control} {...register('name')} />}
        </FormField>
        <FormField
          id="dept-branch"
          label="Sede"
          required
          error={errors.branchId?.message}
          hint={branches.isError ? 'No se pudieron cargar las sedes. Cierra y vuelve a abrir el formulario.' : undefined}
        >
          {(control) => (
            <select {...control} disabled={branches.isPending} {...register('branchId')}>
              <option value="">{branches.isPending ? 'Cargando sedes…' : 'Selecciona una sede'}</option>
              {branchOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField id="dept-description" label="Descripción" error={errors.description?.message}>
          {(control) => <textarea rows={2} {...control} {...register('description')} />}
        </FormField>

        {issue && <ServerIssueAlert issue={issue} onRetry={() => void submit()} />}
        {info && (
          <p role="status" className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">
            {info}
          </p>
        )}

        <FormActions
          pending={isSubmitting}
          label={department ? 'Guardar cambios' : 'Crear departamento'}
          onClose={onClose}
        />
      </form>
    </Modal>
  );
}

export default DepartmentDialog;