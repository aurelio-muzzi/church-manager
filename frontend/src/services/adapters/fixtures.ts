/**
 * ChurchManager Dev Fixtures — Explicit simulated data for development/testing
 * NOT to be confused with production persistence.
 */

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'platform_admin' | 'church_admin' | 'pastor' | 'secretary' | 'treasurer' | 'leader' | 'member';
  tenantId?: string;
  tenantName?: string;
}

export const MOCK_USERS: Record<string, MockUser> = {
  admin: {
    id: 'user-admin-01',
    name: 'Pr. Carlos Eduardo',
    email: 'pastor@churchmanager.app',
    role: 'church_admin',
    tenantId: 'tenant-manaus-central',
    tenantName: 'Igreja Central de Manaus',
  },
  secretary: {
    id: 'user-sec-01',
    name: 'Ana Carolina Silva',
    email: 'secretaria@churchmanager.app',
    role: 'secretary',
    tenantId: 'tenant-manaus-central',
    tenantName: 'Igreja Central de Manaus',
  },
  treasurer: {
    id: 'user-fin-01',
    name: 'Marcos Vinicius Santos',
    email: 'financeiro@churchmanager.app',
    role: 'treasurer',
    tenantId: 'tenant-manaus-central',
    tenantName: 'Igreja Central de Manaus',
  },
  member: {
    id: 'user-mem-01',
    name: 'Gabriel Ferreira Lima',
    email: 'gabriel.membro@gmail.com',
    role: 'member',
    tenantId: 'tenant-manaus-central',
    tenantName: 'Igreja Central de Manaus',
  },
  platform: {
    id: 'user-plat-01',
    name: 'Suporte ChurchManager',
    email: 'admin@platform.churchmanager.app',
    role: 'platform_admin',
  },
};

export const MOCK_TENANTS = [
  {
    id: 'tenant-manaus-central',
    name: 'Igreja Central de Manaus',
    slug: 'central-manaus',
    status: 'active',
    plan: 'enterprise',
    membersCount: 420,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'tenant-belem-norte',
    name: 'Igreja Batista Betel Belém',
    slug: 'betel-belem',
    status: 'active',
    plan: 'standard',
    membersCount: 180,
    createdAt: '2026-02-01T14:30:00Z',
  },
  {
    id: 'tenant-rio-esperanca',
    name: 'Comunidade Esperança RJ',
    slug: 'esperanca-rj',
    status: 'trial',
    membersCount: 95,
    createdAt: '2026-03-10T09:15:00Z',
  },
];
