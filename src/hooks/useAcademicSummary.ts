import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getAcademicSummary } from '../services/academicReportService';
import type { AcademicSummaryParams } from '../types/academicReport';

// La clave empieza por 'reports': al crear, editar o eliminar un antecedente se invalida
// ese prefijo y el consolidado se actualiza solo.
export const academicSummaryKeys = {
  all: ['reports', 'academic-summary'] as const,
  list: (params: AcademicSummaryParams) => [...academicSummaryKeys.all, params] as const,
};

export function useAcademicSummary(params: AcademicSummaryParams) {
  return useQuery({
    queryKey: academicSummaryKeys.list(params),
    queryFn: () => getAcademicSummary(params),
    placeholderData: keepPreviousData,
  });
}
