# ChurchManager — Registro de Progresso

Documento de acompanhamento da evolução do projeto **ChurchManager**, seguindo as diretrizes de engenharia de software e controle rigoroso de branches Git.

---

## Tabela de Etapas

| Etapa | Descrição | Branch | Status | Versão / Tag |
|---|---|---|---|---|
| **01** | Fundação técnica (Laravel, React+TS, Docker, padrões, testes base) | `feature/etapa-01-fundacao` | **Concluída** | `v0.1.0` |
| **02** | Multi-tenancy e Segurança (Isolamento de tenants, Auth Sanctum, Roles/Policies) | `feature/etapa-02-multitenancy-seguranca` | **Concluída** | `v0.2.0` |
| **03** | Secretaria (Membros, Famílias, Visitantes, Congregações, Aprovações) | `feature/etapa-03-secretaria` | **Concluída** | `v0.3.0` |
| **04** | Ministérios e Voluntários (Departamentos, Equipes, Lideranças, Escalas) | `feature/etapa-04-ministerios-voluntarios` | **Concluída** | `v0.4.0` |
| **05** | Eventos e Presença (Cultos, Eventos, Inscrições, Check-in Manual e QR Code) | `feature/etapa-05-eventos-presenca` | **Concluída** | `v0.5.0` |
| **06** | Financeiro Avançado (Contas, Categorias, Dízimos/Ofertas, Despesas, Orçamentos, Conciliação) | `feature/etapa-06-financeiro` | **Concluída** | `v0.6.0` |
| **07** | Portal do Membro (Perfil, Solicitações, Escalas, Eventos, Avisos, Histórico) | `feature/etapa-07-portal-membro` | Próxima | `v0.7.0` |
| **08** | Dashboard e Relatórios (Métricas administrativas, financeiras, exportações CSV/PDF) | `feature/etapa-08-dashboard-relatorios` | Pendente | `v0.8.0` |
| **09** | Auditoria e Preparação para Produção (Revisão de segurança, performance, build final) | `feature/etapa-09-auditoria-producao` | Pendente | `v1.0.0` |

---

## Log Detalhado por Etapa

### Etapa 01 — Fundação
- **Branch**: `feature/etapa-01-fundacao`
- **Data de Início**: 20/10/2026
- **Data de Conclusão**: 20/10/2026
- **Status**: **Concluída**
- **Versão**: `v0.1.0`

### Etapa 02 — Multi-tenancy e Segurança
- **Branch**: `feature/etapa-02-multitenancy-seguranca`
- **Data de Início**: 20/10/2026
- **Data de Conclusão**: 20/10/2026
- **Status**: **Concluída**
- **Versão**: `v0.2.0`

### Etapa 03 — Secretaria
- **Branch**: `feature/etapa-03-secretaria`
- **Data de Início**: 20/10/2026
- **Data de Conclusão**: 20/10/2026
- **Status**: **Concluída**
- **Versão**: `v0.3.0`
- **Implementações**:
  - Modelagem e migrations de `congregations`, `families`, `members`, `visitors`, `visitor_visits` e `member_change_requests`.
  - Isolamento de dados automático com `BelongsToTenant` e `TenantScope` em todas as entidades.
  - Cálculo automático de menor de idade (`is_minor`) com base na data de nascimento para conformidade com a LGPD.
  - CRUD completo de congregações (sedes e filiais) com contagem de membros ativos.
  - Cadastro de membros com filtros avançados (status de vínculo, congregação, menores de idade).
  - Gestão de visitantes com histórico de visitas e fluxo atômico de conversão em membro oficial.
  - Fluxo de aprovação cadastral: solicitações de membros ficam pendentes, com comparativo antes/depois, e são aprovadas ou rejeitadas com justificativa pela secretaria.
  - Frontend completo com abas interativas, skeletons, modais e feedback de validação.
- **Validação**:
  - Testes automatizados com PHPUnit: 20 testes, 84 assertions (100% aprovados), cobrindo isolamento estrito de membros entre tenants, cálculo de menor de idade, conversão de visitantes e fluxo de aprovação/rejeição de alterações cadastrais.
  - Frontend: `tsc -b && vite build` aprovado sem erros ou avisos (100% aprovado).

- **Implementações**:
  - Modelagem e migrations de `tenants`, `tenant_users` e `audit_logs`.
  - Serviço singleton `TenantContext` para autoridade e resolução do tenant ativo.
  - Eloquent `TenantScope` e Trait `BelongsToTenant` garantindo isolamento de dados e injeção automática de `tenant_id`.
  - Middlewares `IdentifyTenant` (com validação estrita de associação e bloqueio contra manipulação de IDs ou suspensão), `EnsurePlatformAdmin` e `EnsureTenantRole`.
  - Autenticação com Laravel Sanctum: login, logout, me e switch-tenant (`/api/v1/auth/*`).
  - Cadastro administrativo de igrejas com administrador inicial atômico em `PlatformTenantController` (`/api/v1/platform/tenants`).
  - Suspensão e reativação de igrejas com justificativa obrigatória e bloqueio operacional automático.
  - Serviço de auditoria `AuditService` com sanitização automática de credenciais e senhas.
  - Frontend com `AuthContext`, tela de login moderna com skeletons, atalhos de demonstração dos seeders, seletor de igreja ativa no Header, logout e gerenciador global de tenants para o Platform Admin.
### Etapa 04 — Ministérios e Voluntários
- **Branch**: `feature/etapa-04-ministerios-voluntarios`
- **Data de Início**: 20/10/2026
- **Data de Conclusão**: 20/10/2026
- **Status**: **Concluída**
- **Versão**: `v0.4.0`
- **Implementações**:
  - Modelagem e migrations de `ministries`, `ministry_roles`, `ministry_volunteers`, `schedules` e `schedule_volunteers`.
  - Isolamento de dados multi-tenant estrito com `BelongsToTenant` e `TenantScope`.
  - Serviço especializado `ScheduleConflictService` com detecção de interseção de intervalos de horário `(start_A < end_B AND end_A > start_B)` na mesma data.
  - Endpoints REST para Ministérios (`/api/v1/tenant/ministries`), papéis/funções, associação e desassociação de voluntários.
  - Endpoints REST para Escalas de Serviço (`/api/v1/tenant/schedules`), publicação, verificação em tempo real de conflitos (`/api/v1/tenant/schedules/check-conflicts`) e fluxo de resposta de voluntários (confirmação, recusa com motivo obrigatório e substituição).
  - Prioridade de middlewares no Laravel 11 (`Authenticate -> IdentifyTenant -> SubstituteBindings`) garantindo resolução correta de rotas e Route-Model Binding com escopo de tenant.
  - Seeders enriquecidos com ministérios reais (Louvor, Infantil, Recepção), voluntários e escalas dominicais.
  - Frontend completo com `MinistryModule.tsx`:
    - Aba de Escalas de Serviço com badges de status de voluntários.
    - Modal de Nova Escala com **Alerta Visual e Chamativo de Conflito de Horário em Tempo Real**.
    - Aba de Ministérios com cores personalizadas e funções cadastradas.
    - Aba de Equipes & Voluntários com busca e associação.
    - Aba de Confirmações de Presença simulando confirmação ou recusa com justificativa.
- **Validação**:
  - Testes automatizados com PHPUnit: 27 testes, 124 assertions (100% aprovados), cobrindo criação de ministérios, escalas, **bloqueio de sobreposição de horário com 422**, confirmação, recusa, substituição e isolamento estrito entre tenants.
  - Frontend: `tsc -b && vite build` aprovado sem erros ou avisos (100% aprovado).

### Etapa 05 — Eventos e Presença
- **Branch**: `feature/etapa-05-eventos-presenca`
- **Data de Início**: 20/10/2026
- **Data de Conclusão**: 20/10/2026
- **Status**: **Concluída**
- **Versão**: `v0.5.0`
- **Implementações**:
  - Modelagem e migrations de `events`, `event_registrations` e `event_attendances`.
  - Isolamento de dados multi-tenant estrito com `BelongsToTenant` e `TenantScope`.
  - Geração automática de `qr_code_token` exclusivo em cada inscrição.
  - Gestão de capacidade máxima (`max_capacity`): quando as vagas confirmadas são preenchidas, novos inscritos são encaminhados automaticamente para a Lista de Espera (`waitlist`).
  - Terminal de check-in com leitor e validador de QR Code Token e busca manual rápida de membros.
  - Idempotência no check-in: detecção de duplicidade com aviso amigável (`already_checked_in`).
  - Endpoint de métricas em tempo real (`/api/v1/tenant/events/{event}/stats`) calculando quórum total, taxa de comparecimento, taxa de ocupação da capacidade e divisão por tipo de check-in (QR Code vs Manual).
  - Seeders enriquecidos com grande conferência de liderança, inscrições ativas e cultos dominicais.
  - Frontend moderno com `EventModule.tsx`:
    - Aba de Cultos & Eventos com cards informativos e modal de novo evento.
    - Terminal de Check-in em tela dividida (Leitor de Token QR Code + Busca e Check-in Manual instantâneo).
    - Aba de Inscrições & Participantes com listagem oficial e cópia de token.
    - Painel de Quórum & Métricas com indicadores numéricos e agrupamento.
- **Validação**:
  - Testes automatizados com PHPUnit: 35 testes, 161 assertions (100% aprovados), cobrindo criação de evento com limite de capacidade, geração de token de QR Code, lista de espera, check-in por token, proteção contra duplicidade, check-in manual, métricas do quórum e isolamento estrito entre tenants.
  - Frontend: `tsc -b && vite build` aprovado sem erros ou avisos (100% aprovado).

### Etapa 06 — Financeiro Avançado
- **Branch**: `feature/etapa-06-financeiro`
- **Data de Início**: 20/10/2026
- **Data de Conclusão**: 20/10/2026
- **Status**: **Concluída**
- **Versão**: `v0.6.0`
- **Implementações**:
  - Modelagem e migrations de `financial_accounts`, `financial_categories`, `financial_transactions` e `financial_budgets`.
  - Isolamento multi-tenant estrito em todas as tabelas e modelos com `BelongsToTenant` e `TenantScope`.
  - Contas bancárias e caixas com tipos: conta corrente, poupança, caixa físico e investimento.
  - Plano de contas categorizado em receitas e despesas com código contábil, cor e hierarquia.
  - Registro de transações com atualização atômica de `current_balance` usando `DB::transaction()` e bloqueio de concorrência com `lockForUpdate()`.
  - Vinculação nominal opcional de dízimos e ofertas ao cadastro de membros da igreja.
  - Inviolabilidade contábil: transações marcadas como reconciliadas (`reconciled = true`) são bloqueadas contra edição e exclusão (HTTP 422).
  - Exclusão segura de lançamentos pendentes com reversão automática do saldo correspondente na conta.
  - Proteção contra exclusão acidental de contas bancárias com transações vinculadas.
  - Demonstrativo Financeiro Consolidado (`/api/v1/tenant/financial/reports/summary`) com saldos consolidados por conta, total de entradas, total de saídas, resultado líquido (superávit/déficit), e receitas/despesas agrupadas por categoria.
  - Extrato Anual de Contribuições por Membro (`/api/v1/tenant/financial/reports/member/{member}`) para emissão de comprovantes de doação e declaração do IRPF.
  - Gestão orçamentária (`/api/v1/tenant/financial/budgets`) com cálculo comparativo entre valor planejado e executado por categoria e alertas de estouro de teto.
  - Seeders enriquecidos com contas bancárias reais (Banco do Brasil, Caixa de Culto), categorias contábeis e lançamentos de dízimos/ofertas e despesas fixas.
  - Frontend completo com `FinancialModule.tsx`:
    - KPIs de topo com Saldo Consolidado, Entradas, Saídas, Superávit Líquido e pendências de conciliação.
    - Aba de Fluxo de Caixa & Lançamentos com filtros por tipo, conta, categoria e busca textual.
    - Modal de Novo Lançamento com seletor de conta, categoria, forma de pagamento e membro nominal para dízimos.
    - Aba de Contas Bancárias & Caixas com cards de saldos e modal de cadastro.
    - Aba de Plano de Contas com visualização segregada de receitas vs despesas.
    - Aba de Conciliação Bancária com botão de conciliação rápida em 1 clique.
    - Aba de Orçamento vs Realizado com barras de progresso e alertas visuais de teto.
    - Aba de Extrato Anual do Membro com demonstrativo detalhado de contribuições.
- **Validação**:
  - Testes automatizados com PHPUnit: 44 testes, 198 assertions (100% aprovados), cobrindo contas, plano de contas, transações de receitas e despesas com atualização de saldo, exclusão com reversão, bloqueio de exclusão/edição de transações conciliadas, relatório resumo consolidado, extrato de contribuições do membro, orçamentos e isolamento estrito entre tenants.
  - Frontend: `tsc -b && vite build` aprovado sem erros ou avisos (100% aprovado).
