import { z } from 'zod';

export const ministryFormSchema = z.object({
  name: z.string().min(3, 'O nome do ministério deve ter pelo menos 3 caracteres'),
  description: z.string().min(5, 'A descrição deve ter pelo menos 5 caracteres'),
  leaderId: z.string().min(1, 'Selecione o líder responsável pelo ministério'),
  leaderName: z.string().min(2, 'Nome do líder é obrigatório'),
  color: z
    .string()
    .min(4, 'Selecione uma cor para identificação visual')
    .default('#4f46e5'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type MinistryFormData = z.infer<typeof ministryFormSchema>;

export const ministryRoleFormSchema = z.object({
  name: z.string().min(2, 'O nome da função deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  requiredVolunteers: z.coerce.number().min(1, 'Quantidade mínima é 1').optional(),
});

export type MinistryRoleFormData = z.infer<typeof ministryRoleFormSchema>;

export const volunteerAssignFormSchema = z.object({
  ministryId: z.string().min(1, 'Selecione o ministério'),
  memberId: z.string().min(1, 'Selecione o membro'),
  roleId: z.string().min(1, 'Selecione a função do voluntário'),
});

export type VolunteerAssignFormData = z.infer<typeof volunteerAssignFormSchema>;

export const scheduleVolunteerItemSchema = z.object({
  memberId: z.string().min(1, 'Selecione o voluntário'),
  roleName: z.string().min(1, 'Informe a função na escala'),
});

export const scheduleFormSchema = z
  .object({
    ministryId: z.string().min(1, 'Selecione o ministério'),
    title: z.string().min(3, 'O título da escala deve ter pelo menos 3 caracteres'),
    description: z.string().optional(),
    date: z.string().min(10, 'Data da escala é obrigatória'),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Horário de início inválido (HH:mm)'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Horário de término inválido (HH:mm)'),
    volunteers: z.array(scheduleVolunteerItemSchema).min(1, 'Adicione pelo menos um voluntário na escala'),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      return data.startTime < data.endTime;
    },
    {
      message: 'O horário de término deve ser posterior ao horário de início',
      path: ['endTime'],
    }
  );

export type ScheduleFormData = z.infer<typeof scheduleFormSchema>;

export const scheduleResponseSchema = z
  .object({
    action: z.enum(['confirm', 'decline', 'substitute']),
    reason: z.string().optional(),
    substituteMemberId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.action === 'decline') {
        return Boolean(data.reason && data.reason.trim().length >= 5);
      }
      return true;
    },
    {
      message: 'Justificativa é obrigatória em caso de recusa (mínimo 5 caracteres)',
      path: ['reason'],
    }
  )
  .refine(
    (data) => {
      if (data.action === 'substitute') {
        return Boolean(data.substituteMemberId && data.substituteMemberId.trim().length > 0);
      }
      return true;
    },
    {
      message: 'Selecione o voluntário substituto',
      path: ['substituteMemberId'],
    }
  );

export type ScheduleResponseFormData = z.infer<typeof scheduleResponseSchema>;

/**
 * Verifica se dois intervalos de horário se sobrepõem na mesma data:
 * (startA < endB && endA > startB)
 */
export function isTimeIntervalOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA < endB && endA > startB;
}
