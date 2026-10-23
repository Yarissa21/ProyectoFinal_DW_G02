import { useState } from 'react';
import BranchesSection from '../components/organization/BranchesSection';
import DepartmentsSection from '../components/organization/DepartmentsSection';
import PositionsSection from '../components/organization/PositionsSection';
import DetailTabs, { type DetailTab } from '../components/employees/DetailTabs';
import PageHeader from '../components/PageHeader';
import { useAuthStore } from '../store/authStore';

type Section = 'branches' | 'departments' | 'positions';

const TAB_PREFIX = 'organization';
const TABS: DetailTab[] = [
  { id: 'branches', label: 'Sedes' },
  { id: 'departments', label: 'Departamentos' },
  { id: 'positions', label: 'Puestos' },
];

function OrganizationPage() {
  const canManage = useAuthStore((state) => state.user?.role.code === 'ADMIN');
  const [section, setSection] = useState<Section>('branches');

  return (
    <section aria-labelledby="organization-title" className="space-y-5">
      <PageHeader
        id="organization-title"
        title="Empresa"
        description={
          canManage
            ? 'Administra las sedes, departamentos y puestos de la organización.'
            : 'Consulta las sedes, departamentos y puestos. Solo un administrador puede modificarlos.'
        }
      />

      <div className="space-y-4">
        <DetailTabs
          idPrefix={TAB_PREFIX}
          label="Secciones de la empresa"
          tabs={TABS}
          active={section}
          onChange={(id) => setSection(id as Section)}
        />
        <div role="tabpanel" id={`${TAB_PREFIX}-panel-${section}`} aria-labelledby={`${TAB_PREFIX}-tab-${section}`}>
          {section === 'branches' && <BranchesSection canManage={canManage} />}
          {section === 'departments' && <DepartmentsSection canManage={canManage} />}
          {section === 'positions' && <PositionsSection canManage={canManage} />}
        </div>
      </div>
    </section>
  );
}

export default OrganizationPage;