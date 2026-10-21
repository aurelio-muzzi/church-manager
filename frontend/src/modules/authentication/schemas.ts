import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório.')
    .email('Informe um endereço de e-mail válido.'),
  password: z
    .string()
    .min(6, 'A senha deve conter no mínimo 6 caracteres.'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório.')
    .email('Informe um endereço de e-mail válido.'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'A nova senha deve ter no mínimo 8 caracteres.'),
    password_confirmation: z
      .string()
      .min(8, 'Confirmação de senha obrigatória.'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'As senhas informadas não coincidem.',
    path: ['password_confirmation'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
