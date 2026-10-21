import { z } from 'zod';

export function calculateAge(birthDateString: string): number {
  if (!birthDateString) return 0;
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function isMinorBirthDate(birthDateString: string): boolean {
  return calculateAge(birthDateString) < 18;
}

export const memberFormSchema = z
  .object({
    name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    phone: z.string().min(8, 'Telefone deve ter ao menos 8 dígitos').optional().or(z.literal('')),
    gender: z.enum(['male', 'female'], {
      required_error: 'Selecione o gênero',
    }),
    birthDate: z.string().min(10, 'Data de nascimento é obrigatória (AAAA-MM-DD)'),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed', 'separated'], {
      required_error: 'Selecione o estado civil',
    }),
    congregationId: z.string().min(1, 'Selecione a congregação'),
    membershipStatus: z.enum(['active', 'inactive', 'under_discipline', 'transferred', 'deceased'], {
      required_error: 'Selecione o status de membro',
    }),
    admissionType: z.enum(['baptism', 'transfer', 'profession_of_faith', 'acclamation']).optional(),
    admissionDate: z.string().optional().or(z.literal('')),
    baptismDate: z.string().optional().or(z.literal('')),
    familyId: z.string().optional().or(z.literal('')),
    familyRole: z.enum(['head', 'spouse', 'child', 'dependent', 'other']).optional(),
    address: z.string().optional().or(z.literal('')),
    neighborhood: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    postalCode: z.string().optional().or(z.literal('')),
    legalGuardianName: z.string().optional().or(z.literal('')),
    legalGuardianPhone: z.string().optional().or(z.literal('')),
    emergencyContactName: z.string().optional().or(z.literal('')),
    emergencyContactPhone: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      // Regra LGPD para Menores de Idade (< 18 anos)
      if (data.birthDate && isMinorBirthDate(data.birthDate)) {
        // Se for menor, é obrigatório informar o nome do responsável ou contato de emergência
        return Boolean(
          (data.legalGuardianName && data.legalGuardianName.trim().length >= 3) ||
            (data.emergencyContactName && data.emergencyContactName.trim().length >= 3)
        );
      }
      return true;
    },
    {
      message: 'Conformidade LGPD: Para menores de 18 anos, informe o Nome do Responsável Legal ou Contato de Emergência.',
      path: ['legalGuardianName'],
    }
  );

export type MemberFormData = z.infer<typeof memberFormSchema>;

export const congregationFormSchema = z.object({
  name: z.string().min(3, 'O nome da congregação deve ter no mínimo 3 caracteres'),
  leaderName: z.string().min(3, 'Nome do líder/pastor responsável é obrigatório'),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado/UF é obrigatório'),
  address: z.string().optional().or(z.literal('')),
  neighborhood: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  isMain: z.boolean().default(false),
});

export type CongregationFormData = z.infer<typeof congregationFormSchema>;

export const familyFormSchema = z.object({
  name: z.string().min(3, 'O nome da família deve ter no mínimo 3 caracteres (ex: Família Silva)'),
  address: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type FamilyFormData = z.infer<typeof familyFormSchema>;

export const visitorFormSchema = z.object({
  name: z.string().min(3, 'O nome do visitante deve ter no mínimo 3 caracteres'),
  congregationId: z.string().min(1, 'Selecione a congregação visitada'),
  phone: z.string().min(8, 'Telefone de contato é obrigatório para acompanhamento'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  firstVisitDate: z.string().min(10, 'Data da primeira visita é obrigatória'),
  howMetChurch: z.string().optional().or(z.literal('')),
  prayerRequest: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type VisitorFormData = z.infer<typeof visitorFormSchema>;

export const visitorVisitFormSchema = z.object({
  visitDate: z.string().min(10, 'Data do culto/visita é obrigatória'),
  serviceName: z.string().min(2, 'Identificação do culto é obrigatória (ex: Culto da Família, Culto de Jovens)'),
  notes: z.string().optional().or(z.literal('')),
});

export type VisitorVisitFormData = z.infer<typeof visitorVisitFormSchema>;

export const reviewChangeRequestSchema = z
  .object({
    action: z.enum(['approve', 'reject']),
    reviewNotes: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.action === 'reject') {
        return Boolean(data.reviewNotes && data.reviewNotes.trim().length >= 3);
      }
      return true;
    },
    {
      message: 'A justificativa é obrigatória ao rejeitar uma solicitação cadastral.',
      path: ['reviewNotes'],
    }
  );

export type ReviewChangeRequestFormData = z.infer<typeof reviewChangeRequestSchema>;
