import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import ErrorAlert from '../ErrorAlert';
import CreateUserDialog, { type UserDefaults } from './CreateUserDialog';
import FormField from './FormField';
import { useLinkedUserIds } from '../../hooks/useLinkedUserIds';
import { useUsers } from '../../hooks/useUsers';
import { describeError } from '../../services/errorMessages';
import { useAuthStore } from '../../store/authStore';
import type { UserAccount } from '../../types/user';

interface UserSelectFieldProps {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  current?: { id: string; email: string } | null;
  getDefaults?: () => UserDefaults;
  wide?: boolean;
}

function optionLabel(user: UserAccount): string {
  return `${user.firstName} ${user.lastName} (${user.email})`;
}

function UserSelectField({ id, label, hint, value, onChange, current, getDefaults, wide }: UserSelectFieldProps) {
  const usersQuery = useUsers({ limit: 100, isActive: true });
  const linkedQuery = useLinkedUserIds();
  const query = usersQuery.isError ? usersQuery : linkedQuery.isError ? linkedQuery : usersQuery;
  const isLoading = usersQuery.isPending || linkedQuery.isPending;
  const isAdmin = useAuthStore((state) => state.user?.role.code === 'ADMIN');
  const [created, setCreated] = useState<UserAccount[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaults, setDefaults] = useState<UserDefaults>({});

  const options = useMemo(() => {
    const linked = new Set(linkedQuery.data ?? []);
    const fetched = (usersQuery.data?.items ?? []).filter(
      (user) => user.role.code === 'EMPLOYEE' && (!linked.has(user.id) || user.id === current?.id),
    );
    const extra = created.filter((user) => !fetched.some((item) => item.id === user.id));
    const items = [...fetched, ...extra].map((user) => ({ id: user.id, name: optionLabel(user) }));
    if (current && !items.some((item) => item.id === current.id)) {
      items.unshift({ id: current.id, name: current.email });
    }
    return items;
  }, [usersQuery.data, linkedQuery.data, created, current]);

  const openDialog = () => {
    setDefaults(getDefaults ? getDefaults() : {});
    setDialogOpen(true);
  };

  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <FormField id={id} label={label} hint={hint}>
        {(control) => (
          <select
            {...control}
            value={value}
            disabled={isLoading || query.isError}
            onChange={(event) => onChange(event.target.value)}
          >
            <option value="">
              {isLoading ? 'Cargando usuarios…' : query.isError ? 'No disponible' : 'Sin usuario vinculado'}
            </option>
            {options.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        )}
      </FormField>

      {query.isError && (
        <div className="mt-2">
          <ErrorAlert compact error={describeError(query.error)} onRetry={() => void query.refetch()} />
        </div>
      )}

      {isAdmin && (
        <button
          type="button"
          onClick={openDialog}
          className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          + Crear usuario nuevo
        </button>
      )}

      {createPortal(
        <CreateUserDialog
          open={dialogOpen}
          defaults={defaults}
          onClose={() => setDialogOpen(false)}
          onCreated={(user) => {
            setCreated((list) => [...list, user]);
            onChange(user.id);
            setDialogOpen(false);
          }}
        />,
        document.body,
      )}
    </div>
  );
}

export default UserSelectField;