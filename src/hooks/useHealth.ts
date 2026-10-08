import { useQuery } from '@tanstack/react-query';
import { getHealth, getLiveness, getReadiness } from '../services/healthService';

export const healthKeys = {
  general: ['health', 'general'] as const,
  live: ['health', 'live'] as const,
  ready: ['health', 'ready'] as const,
};

export function useHealthGeneral() {
  return useQuery({ queryKey: healthKeys.general, queryFn: getHealth, staleTime: 0 });
}

export function useHealthLive() {
  return useQuery({ queryKey: healthKeys.live, queryFn: getLiveness, staleTime: 0 });
}

export function useHealthReady() {
  return useQuery({ queryKey: healthKeys.ready, queryFn: getReadiness, staleTime: 0 });
}