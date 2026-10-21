export const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;

export const DOCUMENT_ACCEPT = '.pdf,.jpg,.jpeg,.png,.doc,.docx';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export function isAllowedDocument(file: File): boolean {
  return ALLOWED_MIME_TYPES.includes(file.type);
}

export function canPreviewDocument(mimeType: string): boolean {
  return mimeType === 'application/pdf' || mimeType.startsWith('image/');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function openBlobInTab(blob: Blob, tab: Window | null, fileName: string): void {
  const url = URL.createObjectURL(blob);
  if (tab) {
    tab.location.href = url;
  } else {
    saveBlob(blob, fileName);
    return;
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}