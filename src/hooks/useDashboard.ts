import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../services/dashboardService';

export const dashboardKeys = {
  all: ['reports', 'dashboard'] as const,
};

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: getDashboard,
    staleTime: 0,
  });
}