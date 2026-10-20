import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppShell, type AppModule } from '../components/layout/AppShell';
import { ExecutiveDashboardModule } from '../components/dashboard/ExecutiveDashboardModule';
import { SecretaryModule } from '../components/secretary/SecretaryModule';
import { MinistryModule } from '../components/ministry/MinistryModule';
import { EventModule } from '../components/event/EventModule';
import { FinancialModule } from '../components/financial/FinancialModule';
import { MemberPortalModule } from '../components/member-portal/MemberPortalModule';
import { ProductionAuditModule } from '../components/audit/ProductionAuditModule';
import { PlatformTenantManager } from '../components/tenants/PlatformTenantManager';

export const AppPage: React.FC = () => {
  const { activeTenant, isPlatformAdmin } = useAuth();

  // Define módulo padrão baseado na role do usuário
  const getDefaultModule = (): AppModule => {
    if (isPlatformAdmin) return 'platform';
    if (activeTenant?.role === 'member') return 'portal';
    return 'dashboard';
  };

  const [activeModule, setActiveModule] = useState<AppModule>(getDefaultModule());

  return (
    <AppShell activeModule={activeModule} onSelectModule={setActiveModule}>
      {activeModule === 'dashboard' && <ExecutiveDashboardModule />}
      {activeModule === 'secretary' && <SecretaryModule />}
      {activeModule === 'ministries' && <MinistryModule />}
      {activeModule === 'events' && <EventModule />}
      {activeModule === 'financial' && <FinancialModule />}
      {activeModule === 'portal' && <MemberPortalModule />}
      {activeModule === 'audit' && <ProductionAuditModule />}
      {activeModule === 'platform' && <PlatformTenantManager />}
    </AppShell>
  );
};
