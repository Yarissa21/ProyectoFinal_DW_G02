export interface ApiSuccess<T> {
  success: true;
  data: T;
  timestamp: string;
  path: string;
  requestId: string;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  path: string;
  requestId: string;
}