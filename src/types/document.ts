export interface DocumentType {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isRequired: boolean;
  isActive: boolean;
}

export interface EmployeeDocument {
  id: string;
  employee: { id: string; firstName: string; lastName: string };
  documentType: DocumentType;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: { id: string; email: string };
  uploadedAt: string;
  expiresAt?: string | null;
}

export interface EmployeeDocumentListParams {
  page?: number;
  limit?: number;
  search?: string;
  documentTypeId?: string;
}

export interface UploadDocumentPayload {
  documentTypeId: string;
  file: File;
  expiresAt?: string;
}

export interface MyDocument {
  id: string;
  documentType: DocumentType;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  expiresAt?: string | null;
}

export interface MyDocumentListParams {
  page?: number;
  limit?: number;
  search?: string;
}
export interface CreateDocumentTypePayload {
  code: string;
  name: string;
  description?: string;
  isRequired?: boolean;
  isActive?: boolean;
}

export interface UpdateDocumentTypePayload {
  name?: string;
  description?: string;
  isRequired?: boolean;
}