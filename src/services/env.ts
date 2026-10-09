const raw = import.meta.env.VITE_API_BASE_URL;

if (typeof raw !== 'string' || raw.trim() === '') {
  throw new Error('Falta la variable VITE_API_BASE_URL en el archivo .env');
}

export const API_BASE_URL = raw.trim().replace(/\/+$/, '');
export const API_URL = `${API_BASE_URL}/api/v1`;