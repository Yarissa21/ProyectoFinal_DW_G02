import { useState } from 'react';
import toast from 'react-hot-toast';
import { toastOrReport, type ErrorDescription } from '../services/errorMessages';
import { saveBlob } from '../utils/documentFiles';

function todayStamp(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function usePdfExport(fetchPdf: () => Promise<Blob>, baseName: string) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<ErrorDescription | null>(null);

  const run = async () => {
    setError(null);
    setIsExporting(true);
    try {
      const blob = await fetchPdf();
      saveBlob(blob, `${baseName}-${todayStamp()}.pdf`);
      toast.success('El PDF se generó correctamente.');
    } catch (failure) {
      toastOrReport(failure, setError);
    } finally {
      setIsExporting(false);
    }
  };

  return { isExporting, error, run };
}