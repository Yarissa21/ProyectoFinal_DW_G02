import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { servidor } from './servidor';
import { useAuthStore } from '../store/authStore';

beforeAll(() => servidor.listen({ onUnhandledFrame: 'error' }));

afterEach(() => {
  cleanup();
  servidor.resetHandlers();
  sessionStorage.clear();
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isInitializing: false,
    logoutReason: null,
  });
});

afterAll(() => servidor.close());