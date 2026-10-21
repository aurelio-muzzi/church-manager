/**
 * Member Portal Module — Validation Schemas
 * ChurchManager Enterprise Multi-Tenant Platform
 */

import { z } from 'zod';

export const memberUpdateRegistrationSchema = z.object({
  phone: z.string().min(10, 'Informe um telefone com DDD válido'),
  email: z.string().email('Informe um endereço de e-mail válido'),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed'], {
    required_error: 'Selecione o estado civil',
  }),
  address: z.string().min(3, 'Endereço residencial é obrigatório'),
  neighborhood: z.string().min(2, 'Bairro é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().length(2, 'UF deve ter exatamente 2 caracteres (ex: AM, SP)'),
  postalCode: z.string().min(8, 'CEP deve conter pelo menos 8 dígitos'),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  justification: z.string().min(5, 'Informe uma breve justificativa para a secretaria analisar a alteração'),
});

export type MemberUpdateRegistrationFormData = z.infer<typeof memberUpdateRegistrationSchema>;

export const memberScheduleResponseSchema = z
  .object({
    status: z.enum(['confirmed', 'declined'], {
      required_error: 'Informe se confirma ou recusa a escala',
    }),
    declineReason: z.string().optional(),
    substituteMemberId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'declined') {
        return Boolean(data.declineReason && data.declineReason.trim().length >= 5);
      }
      return true;
    },
    {
      message: 'A justificativa de ausência é obrigatória para recusar a escala (mínimo 5 caracteres)',
      path: ['declineReason'],
    }
  );

export type MemberScheduleResponseFormData = z.infer<typeof memberScheduleResponseSchema>;
