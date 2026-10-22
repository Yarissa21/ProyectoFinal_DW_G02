import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormActions from '../organization/FormActions';
import Modal from '../Modal';
import FormField from '../employees/FormField';
import ServerIssueAlert from '../employees/ServerIssueAlert';
import { useCreateDocumentType, useUpdateDocumentType } from '../../hooks/useDocuments';
import {
  DOCUMENT_TYPE_FORM_FIELDS,
  documentTypeSchema,
  type DocumentTypeFormValues,
} from '../../schemas/documentTypeSchema';
import type { CreateDocumentTypePayload, DocumentType, UpdateDocumentTypePayload } from '../../types/document';
import { resolveServerIssue, type ServerIssue } from '../../utils/formErrors';

interface DocumentTypeDialogProps {
  documentType?: DocumentType;
  onClose: () => void;
  onSaved: (message: string) => void;
}

function toFormValues(documentType?: DocumentType): DocumentTypeFormValues {
  return {
    code: documentType?.code ?? '',
    name: documentType?.name ?? '',
    description: documentType?.description ?? '',
    isRequired: documentType?.isRequired ?? false,
  };
}

function toCreatePayload(values: DocumentTypeFormValues): CreateDocumentTypePayload {
  const payload: CreateDocumentTypePayload = {
    code: values.code.toUpperCase(),
    name: values.name,
    isRequired: values.isRequired,
  };
  if (values.description) payload.description = values.description;
  return payload;
}

function toUpdatePayload(values: DocumentTypeFormValues, documentType: DocumentType): UpdateDocumentTypePayload {
  const original = toFormValues(documentType);
  const payload: UpdateDocumentTypePayload = {};
  if (values.name !== original.name) payload.name = values.name;
  if (values.description !== original.description && values.description) payload.description = values.description;
  if (values.isRequired !== original.isRequired) payload.isRequired = values.isRequired;
  return payload;
}

function DocumentTypeDialog({ documentType, onClose, onSaved }: DocumentTypeDialogProps) {
  const create = useCreateDocumentType();
  const update = useUpdateDocumentType(documentType?.id ?? '');
  const [issue, setIssue] = useState<ServerIssue | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DocumentTypeFormValues>({
    resolver: zodResolver(documentTypeSchema),
    defaultValues: toFormValues(documentType),
    mode: 'onTouched',
  });

  const submit = handleSubmit(async (values) => {
    setIssue(null);
    setInfo(null);
    try {
      if (documentType) {
        const payload = toUpdatePayload(values, documentType);
        if (Object.keys(payload).length === 0) {
          setInfo('No hay cambios para guardar.');
          return;
        }
        await update.mutateAsync(payload);
        onSaved('Tipo de documento actualizado correctamente.');
      } else {
        await create.mutateAsync(toCreatePayload(values));
        onSaved('Tipo de documento creado correctamente.');
      }
    } catch (error) {
      setIssue(
        resolveServerIssue(error, DOCUMENT_TYPE_FORM_FIELDS, (field, message, focus) =>
          setError(field, { type: 'server', message }, { shouldFocus: focus }),
        ),
      );
    }
  });

  return (
    <Modal
      open
      title={documentType ? 'Editar tipo de documento' : 'Nuevo tipo de documento'}
      onClose={onClose}
      locked={isSubmitting}
    >
      <form onSubmit={submit} noValidate autoComplete="off" className="space-y-4">
        <FormField id="doctype-code" label="Código" required error={errors.code?.message}>
          {(field) =>
            documentType ? (
              <input type="text" {...field} {...register('code')} readOnly disabled />
            ) : (
              <input type="text" placeholder="CONTRATO_LABORAL" {...field} {...register('code')} />
            )
          }
        </FormField>
        {documentType && (
          <p className="-mt-2 text-xs text-slate-600">El código no se puede cambiar después de crear el tipo.</p>
        )}
        <FormField id="doctype-name" label="Nombre" required error={errors.name?.message}>
          {(field) => <input type="text" placeholder="Contrato laboral" {...field} {...register('name')} />}
        </FormField>
        <FormField id="doctype-description" label="Descripción" error={errors.description?.message}>
          {(field) => <textarea rows={2} {...field} {...register('description')} />}
        </FormField>
        <label className="flex items-start gap-2 text-sm text-slate-800">
          <input type="checkbox" className="mt-0.5 size-4" {...register('isRequired')} />
          <span>
            Documento obligatorio
            <span className="block text-xs text-slate-600">
              Los empleados activos quedarán con este documento pendiente hasta que se suba.
            </span>
          </span>
        </label>

        {issue && <ServerIssueAlert issue={issue} onRetry={() => void submit()} />}
        {info && (
          <p role="status" className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">
            {info}
          </p>
        )}

        <FormActions
          pending={isSubmitting}
          label={documentType ? 'Guardar cambios' : 'Crear tipo'}
          onClose={onClose}
        />
      </form>
    </Modal>
  );
}

export default DocumentTypeDialog;