/**
 * Finance Module — Zod Validation Schemas
 * ChurchManager Enterprise Multi-Tenant Platform
 */

import { z } from 'zod';

export const accountFormSchema = z.object({
  name: z.string().min(2, 'O nome da conta deve ter pelo menos 2 caracteres'),
  type: z.enum(['checking', 'cash', 'savings', 'investment'], {
    required_error: 'Selecione o tipo de conta',
  }),
  bankName: z.string().optional(),
  agency: z.string().optional(),
  accountNumber: z.string().optional(),
  initialBalance: z.coerce.number().min(0, 'Saldo inicial não pode ser negativo'),
  congregationId: z.string().optional(),
  notes: z.string().optional(),
});

export type AccountFormData = z.infer<typeof accountFormSchema>;

export const titheOfferingFormSchema = z
  .object({
    categoryType: z.enum(['tithe', 'offering'], {
      required_error: 'Selecione se é Dízimo ou Oferta',
    }),
    offeringType: z
      .enum(['tithe', 'general', 'missions', 'building', 'campaign', 'special'])
      .default('general'),
    isAnonymous: z.boolean().default(false),
    memberId: z.string().optional(),
    contributorName: z.string().optional(),
    amount: z.coerce.number().positive('O valor arrecadado deve ser maior que R$ 0,00'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (formato AAAA-MM-DD)'),
    competency: z.string().regex(/^\d{4}-\d{2}$/, 'Competência inválida (formato AAAA-MM)'),
    congregationId: z.string().min(1, 'Selecione a congregação'),
    paymentMethod: z.enum(
      ['pix', 'cash', 'credit_card', 'debit_card', 'bank_transfer', 'bank_slip'],
      { required_error: 'Selecione a forma de pagamento' }
    ),
    accountId: z.string().min(1, 'Selecione a conta bancária ou caixa de destino'),
    categoryId: z.string().min(1, 'Selecione a categoria financeira'),
    eventId: z.string().optional(),
    documentNumber: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      // Se não for anônimo e for dízimo, idealmente ter membro ou nome informado
      if (!data.isAnonymous && data.categoryType === 'tithe') {
        return Boolean(data.memberId || (data.contributorName && data.contributorName.trim().length > 0));
      }
      return true;
    },
    {
      message: 'Informe o membro dizimista ou marque a opção de dízimo anônimo',
      path: ['memberId'],
    }
  );

export type TitheOfferingFormData = z.infer<typeof titheOfferingFormSchema>;

export const expenseFormSchema = z.object({
  description: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres'),
  supplierName: z.string().min(2, 'O fornecedor ou credor é obrigatório'),
  amount: z.coerce.number().positive('O valor da despesa deve ser maior que R$ 0,00'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de vencimento inválida'),
  paidDate: z.string().optional(),
  status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).default('pending'),
  paymentMethod: z.enum(
    ['pix', 'cash', 'credit_card', 'debit_card', 'bank_transfer', 'bank_slip'],
    { required_error: 'Selecione a forma de pagamento' }
  ),
  accountId: z.string().min(1, 'Selecione a conta bancária de débito'),
  categoryId: z.string().min(1, 'Selecione a categoria da despesa'),
  costCenterId: z.string().optional(),
  congregationId: z.string().min(1, 'Selecione a congregação'),
  documentNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseFormSchema>;

export const quickPayExpenseSchema = z.object({
  paidDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data do pagamento inválida'),
  accountId: z.string().min(1, 'Selecione a conta bancária utilizada para liquidação'),
  paymentMethod: z.enum(
    ['pix', 'cash', 'credit_card', 'debit_card', 'bank_transfer', 'bank_slip'],
    { required_error: 'Selecione a forma de pagamento' }
  ),
});

export type QuickPayExpenseFormData = z.infer<typeof quickPayExpenseSchema>;

export const budgetFormSchema = z.object({
  costCenterId: z.string().min(1, 'Selecione o centro de custo / ministério'),
  year: z.coerce.number().int().min(2020).max(2100),
  plannedAmount: z.coerce.number().positive('O teto orçado deve ser maior que R$ 0,00'),
  alertThresholdPercent: z.coerce.number().min(50).max(100).default(90),
});

export type BudgetFormData = z.infer<typeof budgetFormSchema>;
