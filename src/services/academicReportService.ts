import { http } from './http';
import type { ApiSuccess } from '../types/api';
import type { AcademicSummaryParams, AcademicSummaryReport } from '../types/academicReport';

function cleanParams(params: AcademicSummaryParams): Record<string, string> {
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value) clean[key] = value;
  }
  return clean;
}

export async function getAcademicSummary(params: AcademicSummaryParams): Promise<AcademicSummaryReport> {
  const res = await http.get<ApiSuccess<AcademicSummaryReport>>('/reports/academic-summary', {
    params: cleanParams(params),
  });
  return res.data.data;
}

export async function fetchAcademicSummaryPdf(params: AcademicSummaryParams): Promise<Blob> {
  const res = await http.get<Blob>('/reports/academic-summary/export', {
    params: cleanParams(params),
    responseType: 'blob',
    timeout: 60000,
  });
  return res.data;
}