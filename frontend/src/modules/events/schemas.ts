import { z } from 'zod';

export const eventFormSchema = z
  .object({
    congregationId: z.string().min(1, 'Selecione a congregação responsável'),
    title: z
      .string()
      .min(3, 'O título do evento deve ter no mínimo 3 caracteres')
      .max(120, 'O título deve ter no máximo 120 caracteres'),
    description: z.string().optional(),
    category: z.enum(
      [
        'worship',
        'conference',
        'seminar',
        'workshop',
        'meeting',
        'youth',
        'kids',
        'outreach',
      ],
      { errorMap: () => ({ message: 'Selecione uma categoria válida' }) }
    ),
    type: z.enum(['service', 'special_event'], {
      errorMap: () => ({ message: 'Selecione o tipo de evento' }),
    }),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de início inválida'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de término inválida'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário de início inválido (HH:mm)'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário de término inválido (HH:mm)'),
    location: z.string().min(2, 'O local do evento é obrigatório'),
    address: z.string().optional(),
    maxCapacity: z.coerce.number().min(0, 'Capacidade não pode ser negativa').optional(),
    isRegistrationRequired: z.boolean().default(false),
    registrationFee: z.coerce.number().min(0, 'O valor não pode ser negativo').optional(),
    registrationDeadline: z.string().optional(),
    checkInMethod: z.enum(['manual', 'qr_code', 'both'], {
      errorMap: () => ({ message: 'Selecione um método de check-in válido' }),
    }),
    targetAudience: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate === data.endDate) {
        return data.startTime < data.endTime;
      }
      return data.startDate <= data.endDate;
    },
    {
      message: 'O horário/data de término deve ser posterior ao início',
      path: ['endTime'],
    }
  );

export type EventFormData = z.infer<typeof eventFormSchema>;

export const eventRegistrationFormSchema = z.object({
  attendeeName: z.string().min(3, 'Nome completo deve ter pelo menos 3 caracteres'),
  attendeeEmail: z.string().email('E-mail inválido para confirmação do ingresso'),
  attendeePhone: z.string().min(8, 'Telefone de contato é obrigatório'),
  memberId: z.string().optional(),
});

export type EventRegistrationFormData = z.infer<typeof eventRegistrationFormSchema>;

export const manualAttendanceFormSchema = z.object({
  attendeeId: z.string().min(1, 'Selecione o participante'),
  attendeeType: z.enum(['member', 'visitor']),
  attendeeName: z.string().min(1, 'Nome do participante é obrigatório'),
  notes: z.string().optional(),
});

export type ManualAttendanceFormData = z.infer<typeof manualAttendanceFormSchema>;

export const qrCodeCheckInSchema = z.object({
  qrCode: z.string().min(1, 'O código do QR Code não pode ser vazio'),
});

export type QRCodeCheckInFormData = z.infer<typeof qrCodeCheckInSchema>;
