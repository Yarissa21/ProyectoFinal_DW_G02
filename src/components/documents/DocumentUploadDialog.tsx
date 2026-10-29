import { useState, type FormEvent } from 'react';
import Modal from '../Modal';
import FormField from '../employees/FormField';
import ServerIssueAlert from '../employees/ServerIssueAlert';
import { useDocumentTypes, useUploadDocument } from '../../hooks/useDocuments';
import { describeError } from '../../services/errorMessages';
import { localToday } from '../../schemas/academicSchema';
import type { UploadDocumentPayload } from '../../types/document';
import { DOCUMENT_ACCEPT, formatFileSize, isAllowedDocument, MAX_DOCUMENT_BYTES } from '../../utils/documentFiles';
import type { ServerIssue } from '../../utils/formErrors';

interface DocumentUploadDialogProps {
  employeeId: string;
  open: boolean;
  onClose: () => void;
  onUploaded: (message: string) => void;
}

interface UploadFormProps {
  onUpload: (payload: UploadDocumentPayload) => Promise<unknown>;
  onClose: () => void;
  onUploaded: (message: string) => void;
}

interface FormErrors {
  documentTypeId?: string;
  file?: string;
  expiresAt?: string;
}

const TYPE_MESSAGE = 'Selecciona el tipo de documento.';

function expiresError(value: string): string | undefined {
  return value && value < localToday() ? 'La fecha de vencimiento no puede ser anterior a hoy.' : undefined;
}

function fileError(file: File | null): string | undefined {
  if (!file) return 'Selecciona un archivo.';
  if (!isAllowedDocument(file)) return 'Formato no permitido. Usa PDF, JPG, PNG, DOC o DOCX.';
  if (file.size > MAX_DOCUMENT_BYTES) return 'El archivo supera el máximo de 2 MB.';
  if (file.size === 0) return 'El archivo está vacío.';
  return undefined;
}

function UploadForm({ onUpload, onClose, onUploaded }: UploadFormProps) {
  const types = useDocumentTypes();
  const [documentTypeId, setDocumentTypeId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [issue, setIssue] = useState<ServerIssue | null>(null);
  const [pending, setPending] = useState(false);

  const validate = (): FormErrors => ({
    documentTypeId: documentTypeId ? undefined : TYPE_MESSAGE,
    file: fileError(file),
    expiresAt: expiresError(expiresAt),
  });

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    setIssue(null);
    const found = validate();
    setErrors(found);
    if (Object.values(found).some(Boolean) || !file) return;

    setPending(true);
    try {
      await onUpload({ documentTypeId, file, expiresAt: expiresAt || undefined });
      onUploaded('Documento subido correctamente.');
    } catch (error) {
      setIssue({ error: describeError(error), extra: [] });
      setPending(false);
    }
  };

  const options = types.data?.filter((item) => item.isActive) ?? [];

  return (
    <form onSubmit={(event) => void submit(event)} noValidate autoComplete="off" className="space-y-4">
      <p className="text-sm text-slate-600">
        Los campos marcados con <span aria-hidden="true">*</span>
        <span className="sr-only">asterisco</span> son obligatorios. Formatos: PDF, JPG, PNG, DOC o DOCX, de hasta 2 MB.
      </p>

      <FormField id="doc-type" label="Tipo de documento" required error={errors.documentTypeId}>
        {(control) => (
          <select
            {...control}
            value={documentTypeId}
            disabled={types.isPending || pending}
            onChange={(event) => {
              const value = event.target.value;
              setDocumentTypeId(value);
              setErrors((current) => ({ ...current, documentTypeId: value ? undefined : TYPE_MESSAGE }));
            }}
          >
            <option value="">{types.isPending ? 'Cargando…' : 'Selecciona un tipo'}</option>
            {options.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
                {item.isRequired ? ' (obligatorio)' : ''}
              </option>
            ))}
          </select>
        )}
      </FormField>
      {types.isError && (
        <p role="alert" className="text-sm text-red-700">
          No se pudo cargar el catálogo de tipos de documento.
        </p>
      )}

      <FormField
        id="doc-file"
        label="Archivo"
        required
        error={errors.file}
        hint={file ? `${file.name} · ${formatFileSize(file.size)}` : undefined}
      >
        {(control) => (
          <input
            type="file"
            accept={DOCUMENT_ACCEPT}
            {...control}
            disabled={pending}
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              setFile(selected);
              setErrors((current) => ({ ...current, file: fileError(selected) }));
            }}
          />
        )}
      </FormField>

      <FormField id="doc-expires" label="Fecha de vencimiento" hint="Opcional." error={errors.expiresAt}>
        {(control) => (
          <input
            type="date"
            {...control}
            value={expiresAt}
            disabled={pending}
            onChange={(event) => {
              const value = event.target.value;
              setExpiresAt(value);
              setErrors((current) => ({ ...current, expiresAt: expiresError(value) }));
            }}
          />
        )}
      </FormField>

      {issue && <ServerIssueAlert issue={issue} onRetry={() => void submit()} />}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
        >
          {pending ? 'Subiendo…' : 'Subir documento'}
        </button>
      </div>
    </form>
  );
}

function DocumentUploadDialog({ employeeId, open, onClose, onUploaded }: DocumentUploadDialogProps) {
  const mutation = useUploadDocument(employeeId);

  return (
    <Modal open={open} title="Subir documento" onClose={onClose} locked={mutation.isPending}>
      <UploadForm onUpload={(payload) => mutation.mutateAsync(payload)} onClose={onClose} onUploaded={onUploaded} />
    </Modal>
  );
}

export default DocumentUploadDialog;