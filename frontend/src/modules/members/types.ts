// Members module base definitions
export interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  isMinor: boolean;
  status: 'active' | 'inactive' | 'transferred' | 'deceased';
  congregationId: string;
}
