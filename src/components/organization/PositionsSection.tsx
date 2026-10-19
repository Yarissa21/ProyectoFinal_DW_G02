import { useState } from 'react';
import OrgNotice from './OrgNotice';
import OrgSection, { type OrgColumn } from './OrgSection';
import OrgStatusDialog from './OrgStatusDialog';
import PositionDialog from './PositionDialog';
import { usePositions, useUpdatePositionStatus } from '../../hooks/useOrganization';
import type { Position } from '../../types/organization';

type DialogState = { type: 'form'; position?: Position } | { type: 'status'; position: Position } | null;

const COLUMNS: OrgColumn<Position>[] = [
  { header: 'Código', cell: (item) => <span className="font-medium">{item.code}</span> },
  { header: 'Nombre', primary: true, cell: (item) => item.name },
  {
    header: 'Departamentos',
    cell: (item) =>
      item.departments.length > 0 ? (
        <ul className="flex flex-wrap gap-1">
          {item.departments.map((department) => (
            <li key={department.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-800">
              {department.name}
            </li>
          ))}
        </ul>
      ) : (
        '—'
      ),
  },
  { header: 'Descripción', cell: (item) => item.description || '—' },
];

function PositionsSection({ canManage }: { canManage: boolean }) {
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
        singular="puesto"
        plural="puestos"
        useList={usePositions}
        columns={COLUMNS}
        canManage={canManage}
        onCreate={() => setDialog({ type: 'form' })}
        onEdit={(position) => setDialog({ type: 'form', position })}
        onToggle={(position) => setDialog({ type: 'status', position })}
      />

      {dialog?.type === 'form' && (
        <PositionDialog key={dialog.position?.id ?? 'new'} position={dialog.position} onClose={close} onSaved={saved} />
      )}
      {dialog?.type === 'status' && (
        <OrgStatusDialog
          item={dialog.position}
          singular="puesto"
          deactivateWarning="No se puede desactivar un puesto con empleados vigentes. El sistema lo validará al confirmar."
          useStatus={useUpdatePositionStatus}
          onClose={close}
          onSaved={() =>
            saved(dialog.position.isActive ? 'Puesto desactivado correctamente.' : 'Puesto activado correctamente.')
          }
        />
      )}
    </div>
  );
}

export default PositionsSection;