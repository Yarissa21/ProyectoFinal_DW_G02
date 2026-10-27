import { useState } from 'react';
import toast from 'react-hot-toast';
import CreateUserDialog from '../components/employees/CreateUserDialog';
import OrgSection, { type OrgColumn } from '../components/organization/OrgSection';
import OrgStatusDialog from '../components/organization/OrgStatusDialog';
import PageHeader from '../components/PageHeader';
import UserEditDialog from '../components/users/UserEditDialog';
import { useUpdateUserStatus, useUsers } from '../hooks/useUsers';
import { useAuthStore } from '../store/authStore';
import type { UserAccount } from '../types/user';
import { formatDateTime } from '../utils/format';
import { toRoleCode, USER_ROLE_LABELS } from '../utils/userLabels';

type DialogState = { type: 'create' } | { type: 'edit'; user: UserAccount } | { type: 'status'; user: UserAccount } | null;

function fullName(user: UserAccount): string {
  return `${user.firstName} ${user.lastName}`;
}

function UsersPage() {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [dialog, setDialog] = useState<DialogState>(null);

  const close = () => setDialog(null);
  const saved = (message: string) => {
    setDialog(null);
    toast.success(message);
  };

  const columns: OrgColumn<UserAccount>[] = [
    {
      header: 'Nombre',
      primary: true,
      sortField: 'firstName',
      cell: (item) => (
        <>
          {fullName(item)}
          {item.id === currentUserId && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">Tú</span>
          )}
        </>
      ),
    },
    { header: 'Correo', cell: (item) => <span className="break-all">{item.email}</span> },
    { header: 'Rol', cell: (item) => USER_ROLE_LABELS[toRoleCode(item.role.code)] ?? item.role.name },
    { header: 'Último acceso', cell: (item) => (item.lastLoginAt ? formatDateTime(item.lastLoginAt) : 'Nunca') },
  ];

  return (
    <section aria-labelledby="users-title" className="space-y-5">
      <PageHeader
        id="users-title"
        title="Usuarios"
        description="Administra las cuentas de acceso: crea usuarios, edita sus datos y rol, o desactívalos."
      />

      <OrgSection
        singular="usuario"
        plural="usuarios"
        searchPlaceholder="Nombre o correo"
        useList={useUsers}
        columns={columns}
        canManage
        canToggle={(user) => user.id !== currentUserId}
        onCreate={() => setDialog({ type: 'create' })}
        onEdit={(user) => setDialog({ type: 'edit', user })}
        onToggle={(user) => setDialog({ type: 'status', user })}
      />

      <CreateUserDialog
        open={dialog?.type === 'create'}
        defaults={{}}
        chooseRole
        onClose={close}
        onCreated={() => saved('Usuario creado correctamente.')}
      />
      {dialog?.type === 'edit' && <UserEditDialog key={dialog.user.id} user={dialog.user} onClose={close} onSaved={saved} />}
      {dialog?.type === 'status' && (
        <OrgStatusDialog
          item={{ id: dialog.user.id, name: fullName(dialog.user), isActive: dialog.user.isActive }}
          singular="usuario"
          deactivateWarning="La persona no podrá iniciar sesión mientras la cuenta esté desactivada. El sistema validará si la cuenta puede desactivarse."
          useStatus={useUpdateUserStatus}
          onClose={close}
          onSaved={() => saved(dialog.user.isActive ? 'Usuario desactivado correctamente.' : 'Usuario activado correctamente.')}
        />
      )}
    </section>
  );
}

export default UsersPage;