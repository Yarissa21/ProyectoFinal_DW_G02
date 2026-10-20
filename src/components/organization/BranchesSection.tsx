import { useState } from 'react';
import BranchDialog from './BranchDialog';
import OrgNotice from './OrgNotice';
import OrgSection, { type OrgColumn } from './OrgSection';
import OrgStatusDialog from './OrgStatusDialog';
import { useBranches, useUpdateBranchStatus } from '../../hooks/useOrganization';
import type { Branch } from '../../types/organization';

type DialogState = { type: 'form'; branch?: Branch } | { type: 'status'; branch: Branch } | null;

const COLUMNS: OrgColumn<Branch>[] = [
  { header: 'Código', cell: (item) => <span className="font-medium">{item.code}</span> },
  {
    header: 'Nombre',
    primary: true,
    cell: (item) => (
      <>
        {item.name}
        {item.isHeadquarters && (
          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
            Principal
          </span>
        )}
      </>
    ),
  },
  { header: 'Dirección', cell: (item) => item.address },
  {
    header: 'Contacto',
    cell: (item) =>
      item.phone || item.email ? (
        <>
          {item.phone && <span className="block">{item.phone}</span>}
          {item.email && <span className="block break-all text-slate-700">{item.email}</span>}
        </>
      ) : (
        '—'
      ),
  },
];

function BranchesSection({ canManage }: { canManage: boolean }) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const close = () => setDialog(null);
  const saved = (message: string) => {
    setDialog(null);
    setNotice(message);
  };

  return (
    <div className="space-y-4">
      <OrgNotice message={notice} />
      <OrgSection
        singular="sede"
        plural="sedes"
        feminine
        useList={useBranches}
        columns={COLUMNS}
        canManage={canManage}
        onCreate={() => setDialog({ type: 'form' })}
        onEdit={(branch) => setDialog({ type: 'form', branch })}
        onToggle={(branch) => setDialog({ type: 'status', branch })}
      />

      {dialog?.type === 'form' && (
        <BranchDialog key={dialog.branch?.id ?? 'new'} branch={dialog.branch} onClose={close} onSaved={saved} />
      )}
      {dialog?.type === 'status' && (
        <OrgStatusDialog
          item={dialog.branch}
          singular="sede"
          feminine
          deactivateWarning="No se puede desactivar la sede principal ni una sede con departamentos o empleados vigentes. El sistema lo validará al confirmar."
          useStatus={useUpdateBranchStatus}
          onClose={close}
          onSaved={() => saved(dialog.branch.isActive ? 'Sede desactivada correctamente.' : 'Sede activada correctamente.')}
        />
      )}
    </div>
  );
}

export default BranchesSection;