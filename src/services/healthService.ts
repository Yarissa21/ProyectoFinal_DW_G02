import { http } from './http';
import type { ApiSuccess } from '../types/api';
import type { HealthResponse, LivenessResponse } from '../types/health';

export async function getHealth(): Promise<HealthResponse> {
  const res = await http.get<ApiSuccess<HealthResponse>>('/health');
  return res.data.data;
}

export async function getLiveness(): Promise<LivenessResponse> {
  const res = await http.get<ApiSuccess<LivenessResponse>>('/health/live');
  return res.data.data;
}

export async function getReadiness(): Promise<HealthResponse> {
  const res = await http.get<ApiSuccess<HealthResponse>>('/health/ready');
  return res.data.data;
}