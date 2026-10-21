import { MOCK_USERS, MOCK_TENANTS, MockUser } from './fixtures';

/**
 * DevMockAdapter
 * Intercepts requests when VITE_USE_DEV_MOCK=true to provide simulated responses
 * strictly for local interface development.
 */
class DevMockAdapter {
  private activeUser: MockUser | null = null;

  constructor() {
    // Default initial mock user in dev mode
    this.activeUser = MOCK_USERS.admin;
  }

  public isEnabled(): boolean {
    return import.meta.env.VITE_USE_DEV_MOCK === 'true';
  }

  public getActiveUser(): MockUser | null {
    return this.activeUser;
  }

  public setActiveUser(roleOrKey: keyof typeof MOCK_USERS): MockUser {
    const user = MOCK_USERS[roleOrKey] || MOCK_USERS.admin;
    this.activeUser = user;
    return user;
  }

  public getTenants() {
    return MOCK_TENANTS;
  }

  public logMockAction(action: string, payload?: unknown) {
    if (import.meta.env.DEV) {
      console.info(`[DevMockAdapter] ${action}`, payload ?? '');
    }
  }
}

export const devMockAdapter = new DevMockAdapter();
