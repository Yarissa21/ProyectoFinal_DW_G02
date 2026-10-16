import { http } from './http';
import type { ApiSuccess } from '../types/api';
import type { AcademicSummaryParams, AcademicSummaryReport } from '../types/academicReport';

export async function getAcademicSummary(params: AcademicSummaryParams): Promise<AcademicSummaryReport> {
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value) clean[key] = value;
  }
  const res = await http.get<ApiSuccess<AcademicSummaryReport>>('/reports/academic-summary', { params: clean });
  return res.data.data;
}
