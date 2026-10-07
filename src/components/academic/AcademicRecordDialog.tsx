import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../Modal';
import FormField from '../employees/FormField';
import ServerIssueAlert from '../employees/ServerIssueAlert';
import { useCreateAcademicRecord, useUpdateAcademicRecord } from '../../hooks/useAcademicRecords';
import {
  ACADEMIC_FORM_FIELDS,
  buildAcademicSchema,
  localToday,
  type AcademicFormValues,
} from '../../schemas/academicSchema';
import type {
  AcademicRecord,
  CreateAcademicRecordPayload,
  UpdateAcademicRecordPayload,
} from '../../types/academic';
import { ACADEMIC_TYPE_LABELS, ACADEMIC_TYPE_VALUES } from '../../utils/academicLabels';
import {
  academicToFormValues,
  EMPTY_ACADEMIC_VALUES,
  toCreateAcademicPayload,
  toUpdateAcademicPayload,
} from '../../utils/academicPayload';
import { toDateInput } from '../../utils/format';
import { resolveServerIssue, type ServerIssue } from '../../utils/formErrors';

interface AcademicRecordDialogProps {
  employeeId: string;
  /** Si es null el diálogo registra un antecedente nuevo; si trae datos, edita ese antecedente. */
  record: AcademicRecord | null;
  open: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface AcademicFormProps {
  record: AcademicRecord | null;
  onCreate: (payload: CreateAcademicRecordPayload) => Promise<unknown>;
  onUpdate: (payload: UpdateAcademicRecordPayload) => Promise<unknown>;
  onClose: () => void;
  onSaved: (message: string) => void;
}

function AcademicForm({ record, onCreate, onUpdate, onClose, onSaved }: AcademicFormProps) {
  const [issue, setIssue] = useState<ServerIssue | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const schema = useMemo(
    () => buildAcademicSchema(record ? toDateInput(record.graduationDate) : ''),
    [record],
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AcademicFormValues>({
    resolver: zodResolver(schema),
    defaultValues: record ? academicToFormValues(record) : EMPTY_ACADEMIC_VALUES,
    mode: 'onTouched',
  });

  const submit = handleSubmit(async (values) => {
    setIssue(null);
    setInfo(null);
    try {
      if (record) {
        const payload = toUpdateAcademicPayload(values, record);
        if (Object.keys(payload).length === 0) {
          setInfo('No hay cambios para guardar.');
          return;
        }
        await onUpdate(payload);
        onSaved('Antecedente académico actualizado correctamente.');
        return;
      }
      await onCreate(toCreateAcademicPayload(values));
      onSaved('Antecedente académico registrado correctamente.');
    } catch (error) {
      setIssue(
        resolveServerIssue(error, ACADEMIC_FORM_FIELDS, (field, message, focus) =>
          setError(field, { type: 'server', message }, { shouldFocus: focus }),
        ),
      );
    }
  });

  return (
    <form onSubmit={submit} noValidate autoComplete="off" className="space-y-4">
      <p className="text-sm text-slate-600">
        Los campos marcados con <span aria-hidden="true">*</span>
        <span className="sr-only">asterisco</span> son obligatorios.
      </p>

      <FormField id="acad-type" label="Tipo de estudio" required error={errors.type?.message}>
        {(control) => (
          <select {...control} {...register('type')}>
            {ACADEMIC_TYPE_VALUES.map((value) => (
              <option key={value} value={value}>
                {ACADEMIC_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <FormField id="acad-title" label="Título o nombre del estudio" required error={errors.title?.message}>
        {(control) => <input type="text" {...control} {...register('title')} />}
      </FormField>

      <FormField id="acad-institution" label="Institución" required error={errors.institution?.message}>
        {(control) => <input type="text" {...control} {...register('institution')} />}
      </FormField>

      <FormField
        id="acad-graduationDate"
        label="Fecha de graduación"
        hint="Opcional. No puede ser posterior a hoy."
        error={errors.graduationDate?.message}
      >
        {(control) => <input type="date" max={localToday()} {...control} {...register('graduationDate')} />}
      </FormField>

      <FormField
        id="acad-credentialCode"
        label="Código de credencial"
        hint="Opcional. Por ejemplo, el número de colegiado o de certificado."
        error={errors.credentialCode?.message}
      >
        {(control) => <input type="text" {...control} {...register('credentialCode')} />}
      </FormField>

      <FormField id="acad-notes" label="Notas" hint="Opcional." error={errors.notes?.message}>
        {(control) => <textarea rows={3} {...control} {...register('notes')} />}
      </FormField>

      {issue && <ServerIssueAlert issue={issue} onRetry={() => void submit()} />}

      {info && (
        <p role="status" className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">
          {info}
        </p>
      )}

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
          {isSubmitting ? 'Guardando…' : record ? 'Guardar cambios' : 'Registrar antecedente'}
        </button>
      </div>
    </form>
  );
}

function AcademicRecordDialog({ employeeId, record, open, onClose, onSaved }: AcademicRecordDialogProps) {
  const createMutation = useCreateAcademicRecord(employeeId);
  const updateMutation = useUpdateAcademicRecord(employeeId, record?.id ?? '');
  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      open={open}
      title={record ? 'Editar antecedente académico' : 'Agregar antecedente académico'}
      onClose={onClose}
      locked={pending}
    >
      <AcademicForm
        record={record}
        onCreate={(payload) => createMutation.mutateAsync(payload)}
        onUpdate={(payload) => updateMutation.mutateAsync(payload)}
        onClose={onClose}
        onSaved={onSaved}
      />
    </Modal>
  );
}

export default AcademicRecordDialog;
