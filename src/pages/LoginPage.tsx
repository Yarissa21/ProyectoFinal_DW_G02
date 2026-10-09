import { useState } from 'react';
import { Navigate, useLocation, type Location } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema';
import { login } from '../services/authService';
import { describeError, type ErrorDescription } from '../services/errorMessages';
import { useAuthStore } from '../store/authStore';
import { homePathForRole } from '../utils/roles';
import FullScreenLoader from '../components/FullScreenLoader';
import ErrorAlert from '../components/ErrorAlert';

function LoginPage() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const logoutReason = useAuthStore((state) => state.logoutReason);
  const [serverError, setServerError] = useState<ErrorDescription | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (isInitializing) return <FullScreenLoader />;

  if (isAuthenticated && user) {
    const from = (location.state as { from?: Location } | null)?.from;
    const target = from ? `${from.pathname}${from.search}` : homePathForRole(user.role.code);
    return <Navigate to={target} replace />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values);
    } catch (error) {
      setServerError(describeError(error));
    }
  };

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-slate-50';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md rounded-2xl border-t-4 border-amber-400 bg-white p-8 shadow-xl">
        <span
          aria-hidden="true"
          className="mb-4 grid size-12 place-items-center rounded-xl bg-amber-400 text-lg font-extrabold text-slate-900"
        >
          RH
        </span>
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Sistema de RRHH</h1>
        <p className="mb-6 text-slate-600">Inicia sesión para continuar</p>

        {logoutReason === 'expired' && !serverError && (
          <div role="status" className="mb-5 rounded-lg border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Tu sesión venció. Inicia sesión de nuevo para continuar.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              disabled={isSubmitting}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={inputClass}
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1 text-sm text-red-700">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={isSubmitting}
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={inputClass}
              {...register('password')}
            />
            {errors.password && (
              <p id="password-error" role="alert" className="mt-1 text-sm text-red-700">
                {errors.password.message}
              </p>
            )}
          </div>

          {serverError && (
            <ErrorAlert compact error={serverError} onRetry={() => void handleSubmit(onSubmit)()} />
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="w-full rounded-lg bg-slate-900 py-3 font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;