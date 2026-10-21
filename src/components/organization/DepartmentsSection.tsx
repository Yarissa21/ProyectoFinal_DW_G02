import { useState } from 'react';
import { useTimedNotice } from '../../hooks/useTimedNotice';
import DepartmentDialog from './DepartmentDialog';
import OrgNotice from './OrgNotice';
import OrgSection, { type OrgColumn } from './OrgSection';
import OrgStatusDialog from './OrgStatusDialog';
import { useDepartments, useUpdateDepartmentStatus } from '../../hooks/useOrganization';
import type { Department } from '../../types/organization';

type DialogState = { type: 'form'; department?: Department } | { type: 'status'; department: Department } | null;

const COLUMNS: OrgColumn<Department>[] = [
  { header: 'Código', cell: (item) => <span className="font-medium">{item.code}</span> },
  { header: 'Nombre', primary: true, cell: (item) => item.name },
  {
    header: 'Sede',
    cell: (item) => (
      <>
        {item.branch.name}
        {!item.branch.isActive && <span className="ml-1 text-xs text-slate-600">(inactiva)</span>}
      </>
    ),
  },
  { header: 'Descripción', cell: (item) => item.description || '—' },
];

function DepartmentsSection({ canManage }: { canManage: boolean }) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [notice, setNotice] = useTimedNotice();

  const close = () => setDialog(null);
  const saved = (message: string) => {
    setDialog(null);
    setNotice(message);
  };

  return (
    <div className="space-y-4">
      <OrgNotice message={notice} />
      <OrgSection
        singular="departamento"
        plural="departamentos"
        useList={useDepartments}
        columns={COLUMNS}
        canManage={canManage}
        onCreate={() => setDialog({ type: 'form' })}
        onEdit={(department) => setDialog({ type: 'form', department })}
        onToggle={(department) => setDialog({ type: 'status', department })}
      />

      {dialog?.type === 'form' && (
        <DepartmentDialog
          key={dialog.department?.id ?? 'new'}
          department={dialog.department}
          onClose={close}
          onSaved={saved}
        />
      )}
      {dialog?.type === 'status' && (
        <OrgStatusDialog
          item={dialog.department}
          singular="departamento"
          deactivateWarning="No se puede desactivar un departamento con empleados vigentes. Sus puestos seguirán activos, pero no podrán usarse en ese departamento."
          useStatus={useUpdateDepartmentStatus}
          onClose={close}
          onSaved={() =>
            saved(dialog.department.isActive ? 'Departamento desactivado correctamente.' : 'Departamento activado correctamente.')
          }
        />
      )}
    </div>
  );
}

export default DepartmentsSection;