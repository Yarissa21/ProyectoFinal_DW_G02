import { useQuery } from '@tanstack/react-query';
import { getEmployeeCatalogs } from '../services/catalogService';

export const catalogKeys = {
  employees: ['employee-catalogs'] as const,
};

export function useEmployeeCatalogs() {
  return useQuery({
    queryKey: catalogKeys.employees,
    queryFn: getEmployeeCatalogs,
    staleTime: 5 * 60_000,
  });
}