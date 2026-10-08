export interface InstanceIdentity {
  groupId: string;
  serviceName: string;
  revision: string;
}

export type HealthStatus = 'ok' | 'degraded';

export interface HealthResponse {
  status: HealthStatus;
  service: string;
  instance: InstanceIdentity;
  dependencies: {
    database: 'up' | 'down';
  };
  timestamp: string;
}

export interface LivenessResponse {
  status: 'ok';
  service: string;
  instance: InstanceIdentity;
  timestamp: string;
}