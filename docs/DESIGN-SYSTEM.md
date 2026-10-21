# ChurchManager — Design System & Tokens Visuais

Este documento padroniza a linguagem visual, tokens semânticos, acessibilidade e componentes reutilizáveis do frontend do **ChurchManager**.

---

## 1. Princípios de Design

1. **Mobile-First**: Toda interface é concebida primeiro para telas compactas (smartphones de líderes e membros), expandindo com elegância para tablets e monitores desktop.
2. **Dark Mode como Padrão**: Modo escuro ativado inicialmente para máxima imersão visual, com alternância instantânea para modo claro persistido no navegador.
3. **Cores Semânticas**: Nenhum valor hexadecimal ou RGB arbitrário espalhado no código. Todas as cores utilizam variáveis CSS no padrão HSL.
4. **Acessibilidade e Feedback**: Alvos de toque generosos (mínimo 44x44px), contraste validado (WCAG AA), foco visível (`focus-visible:ring-2`) e skeletons proporcionais ao conteúdo esperado.

---

## 2. Tokens de Cores (HSL)

### Modo Escuro (Padrão)
| Token | Descrição | HSL |
|---|---|---|
| `--background` | Fundo principal da página | `224 71% 4%` |
| `--foreground` | Texto principal | `210 20% 98%` |
| `--card` | Fundo de cartões e modais | `224 71% 6%` |
| `--card-foreground` | Texto de cartões | `210 20% 98%` |
| `--primary` | Destaque e ações principais | `238 84% 67%` (Índigo vibrante) |
| `--primary-foreground` | Texto sobre elemento primário | `210 20% 98%` |
| `--secondary` | Ações e elementos secundários | `215 28% 12%` |
| `--muted` | Fundos suaves e desabilitados | `215 28% 12%` |
| `--muted-foreground` | Rótulos secundários e legendas | `217.9 10.6% 64.9%` |
| `--border` | Bordas e divisores | `215 28% 14%` |
| `--destructive` | Ações perigosas / erros | `0 62.8% 30.6%` |
| `--success` | Confirmações e presenças | `142 71% 45%` (Verde esmeralda) |
| `--warning` | Alertas e pendências | `38 92% 50%` (Âmbar) |

---

## 3. Tipografia

- **Família Sans**: `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`
- **Família Mono**: `'JetBrains Mono', monospace` (para QR codes, logs e valores monetários)

---

## 4. Componentes Base Implementados

- `Button`: Variantes `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`. Tamanhos `sm`, `default`, `lg`, `icon`. Suporte a `asChild` com Radix Slot.
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- `Badge`: Variantes `default`, `secondary`, `destructive`, `outline`, `success`, `warning`.
- `Skeleton`: Indicador de carregamento suave com animação pulse.
