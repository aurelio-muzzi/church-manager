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
| **07** | Portal do Membro (Perfil, Solicitações, Escalas, Eventos, Avisos, Histórico) | `feature/etapa-07-portal-membro` | **Concluída** | `v0.7.0` |
| **08** | Dashboard e Relatórios (Métricas administrativas, financeiras, exportações CSV/PDF) | `feature/etapa-08-dashboard-relatorios` | **Concluída** | `v0.8.0` |
| **09** | Auditoria e Preparação para Produção (Revisão de segurança, performance, build final) | `feature/etapa-09-auditoria-producao` | **Concluída** | `v1.0.0` |
| **UX** | Limpeza de UI SaaS (Sidebar profissional, login minimalista, remoção de termos técnicos) | `feature/ui-saas-layout-cleanup` | **Concluída** | `v1.0.1` |
| **FIX** | Correção de Renderização do Dashboard e Módulos (Integração Tailwind CSS v4 no Vite) | `fix/dashboard-tailwind-styles` | **Concluída** | `v1.0.2` |
| **PERF** | Otimização de Performance (OPcache CLI, Multi-workers PHP e Lazy Loading por Aba) | `fix/perf-opcache-lazyloading-workers` | **Concluída** | `v1.0.3` |

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

### Etapa 07 — Portal do Membro
- **Branch**: `feature/etapa-07-portal-membro`
- **Data de Início**: 20/10/2026
- **Data de Conclusão**: 20/10/2026
- **Status**: **Concluída**
- **Versão**: `v0.7.0`
- **Implementações**:
  - Modelagem e migrations de `prayer_requests` (pedidos de oração e atendimento pastoral com suporte a sigilo/confidencialidade) e `church_notices` (mural de comunicados com avisos fixados, categorias e datas de expiração).
  - Isolamento multi-tenant estrito com `BelongsToTenant` e `TenantScope` em todas as novas entidades.
  - `MemberPortalController` com 11 endpoints REST dedicados à experiência do membro:
    - `/dashboard`: Resumo de escalas pendentes, próximas escalas, inscrições ativas com QR Code e avisos fixados.
    - `/profile` & `/profile/update-request`: Consulta do perfil com família e congregação, e fluxo formal de solicitação de alteração cadastral enviado à secretaria.
    - `/schedules` & `/schedules/{scheduleVolunteer}/respond`: Visualização exclusiva de escalas em que o membro está alocado, confirmação de presença e recusa com justificativa obrigatória (bloqueio 403 em escalas alheias).
    - `/events` & `/events/{event}/register`: Inscrição direta em eventos futuros com geração automática de `qr_code_token` para check-in no culto.
    - `/contributions`: Extrato pessoal de contribuições financeiras e dízimos nominais com total anual para conformidade do IRPF.
    - `/prayer-requests`: Envio de pedidos de oração (gerais e confidenciais apenas para a equipe pastoral) com acompanhamento de status (`pending`, `praying`, `answered`).
    - `/notices`: Mural oficial de avisos da igreja com destaques fixados e filtros por categoria.
  - Seeders enriquecidos com membro modelo (`membro@batistacentral.local`), escalas pendentes, inscrição ativa na conferência com token de QR Code, pedidos de oração e avisos oficiais no mural.
  - Frontend completo com `MemberPortalModule.tsx`:
    - Saudação personalizada e Cartão Digital de Membro com dados oficiais e identificador.
    - Aba de Minhas Escalas com botões de confirmação instantânea e modal de justificativa de recusa.
    - Aba de Meus Eventos com Cartão do Participante, Token de Check-in em destaque e botão de cópia rápida.
    - Aba de Pedidos de Oração com formulário interativo e opção de confidencialidade.
    - Aba de Mural de Avisos com cards filtráveis por categoria e avisos fixados com badge dourada.
    - Aba de Extrato de Dízimos com total anual consolidado e tabela transparente.
    - Aba de Atualização Cadastral simplificada com resumo do perfil e envio para a secretaria.
- **Validação**:
  - Testes automatizados com PHPUnit: 53 testes, 238 assertions (100% aprovados), cobrindo dashboard do membro, perfil, envio de solicitação de alteração cadastral, consulta de escalas, confirmação de escala, recusa com motivo, bloqueio contra resposta em escala alheia (403), inscrição em evento com QR Code Token, consulta exclusiva de dízimos do próprio membro, pedidos de oração e mural de avisos.
  - Frontend: `tsc -b && vite build` aprovado sem erros ou avisos (100% aprovado).

### Etapa 08 — Dashboard Executivo e Relatórios (BI)
- **Branch**: `feature/etapa-08-dashboard-relatorios`
- **Data de Início**: 20/10/2026
- **Data de Conclusão**: 20/10/2026
- **Status**: **Concluída**
- **Versão**: `v0.8.0`
- **Implementações**:
  - Serviço analítico `DashboardAnalyticsService` com inteligência e métricas em tempo real isoladas por tenant:
    - `getExecutiveOverview()`: total de membros ativos, novos membros no mês corrente e mês anterior, taxa percentual de crescimento líquido, contagem de voluntários ativos, taxa de engajamento ministerial %, presenças nos últimos 30 dias e consolidado financeiro (saldo em contas, receitas do mês, despesas do mês, resultado líquido e indicador de superávit/déficit).
    - `getDemographics()`: distribuição por gênero (masculino, feminino, outro, não informado), faixas etárias agrupadas (<12, 12-17, 18-29, 30-59, 60+) e distribuição por congregação com identificação de Sede vs Filiais.
    - `getMinistryStats()`: voluntários alocados por departamento com cores personalizadas e eficiência das escalas do mês (total, confirmadas, pendentes, recusadas e taxa % de confirmação).
    - `getFinancialEvolution()`: timeline histórica de 6 meses com receitas arrecadadas vs despesas pagas e resultado líquido.
    - `getPastoralAlerts()`: radar pastoral de retenção identificando membros ausentes há mais de 60 dias sem check-in registrado (com contatos de telefone e e-mail com botões diretos de ligação e mensagem) e pedidos de oração pendentes há mais de 7 dias sem atendimento.
    - `exportMembersCsv()`, `exportFinancialCsv()`, `exportAttendanceCsv()`: exportações seguras em formato CSV com cabeçalhos padronizados, separador ponto-e-vírgula (`;`) e codificação UTF-8 com BOM (`\xEF\xBB\xBF`) para compatibilidade nativa com Microsoft Excel e Google Planilhas.
  - `DashboardController` com 8 endpoints REST sob prefixo `/tenant/dashboard/*`:
    - `GET /executive`
    - `GET /demographics`
    - `GET /ministries`
    - `GET /financial-evolution`
    - `GET /pastoral-alerts`
    - `GET /export/members`
    - `GET /export/financial`
    - `GET /export/attendance`
  - Frontend completo com `ExecutiveDashboardModule.tsx`:
    - Aba Visão Geral & Finanças com 4 cards de KPIs com tendências e crescimento, quadro de resultado operacional e gráfico de barras semestral com tooltips e comparativos.
    - Aba Demografia & Congregações com barras de progresso proporcionais para gênero e faixas etárias, e cards por congregação.
    - Aba Ministérios & Voluntariado com eficiência de escalas e contagem de voluntários por equipe.
    - Aba Cuidado Pastoral & Alertas com tabela de membros ausentes (>60 dias) com botões rápidos de ligação (`tel:`) e e-mail (`mailto:`), e pedidos de oração sem atendimento.
    - Aba Central de Exportações com 3 cards de download direto em 1 clique (Membros, Movimentações Financeiras e Histórico de Presenças).
- **Validação**:
  - Testes automatizados com PHPUnit: 62 testes, 282 assertions (100% aprovados), cobrindo visão executiva, demografia, ministérios, evolução financeira, alertas pastorais, exportações em CSV de membros, financeiro e presenças, e isolamento estrito entre tenants.
  - Frontend: `tsc -b && vite build` aprovado sem erros ou avisos (100% aprovado).

### Etapa 09 — Auditoria e Preparação para Produção (Certificação Final)
- **Branch**: `feature/etapa-09-auditoria-producao`
- **Data de Início**: 20/10/2026
- **Data de Conclusão**: 20/10/2026
- **Status**: **Concluída**
- **Versão**: `v1.0.0`
- **Implementações**:
  - Middleware de Segurança `SecurityHeaders`:
    - `X-Frame-Options: DENY` (prevenção contra Clickjacking).
    - `X-Content-Type-Options: nosniff` (bloqueio de MIME sniffing).
    - `X-XSS-Protection: 1; mode=block` e `Referrer-Policy: strict-origin-when-cross-origin`.
    - `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
    - Remoção do header `X-Powered-By` para ocultação de tecnologia.
    - Content Security Policy (CSP) segura para comunicação com SPA e API.
  - Rate Limiting e Proteção contra Brute Force:
    - Limitador estrito para `/api/v1/auth/login` (15 requisições/minuto por IP com retorno HTTP 429).
    - Limitador para check-in e eventos (40 requisições/minuto).
    - Limitador geral da API (120 requisições/minuto por usuário/IP).
  - Otimizações de Query & Eloquent:
    - `Model::preventLazyLoading` ativo em ambientes não produtivos para detecção de problemas de N+1.
  - Endpoints de Auditoria e Prontidão:
    - `GET /api/v1/system/readiness`: Verificação pública/operacional de 10 requisitos críticos com Score de Prontidão (100%).
    - `GET /api/v1/tenant/audit/simulate-isolation-test`: Autoteste em tempo real executado pelo tenant ativo que audita 100% das entidades de domínio e registra evento no log de auditoria `audit_logs`.
  - Frontend Completo com `ProductionAuditModule.tsx`:
    - Cabeçalho com Score de Prontidão (100%) e especificações de runtime (Laravel 11, PHP 8.4, MySQL 8.0, America/Manaus).
    - Aba de Checklist de Produção com 10 checagens categorizadas com status e detalhes.
    - Aba de Autoteste de Isolamento ao Vivo com execução sob demanda e emissão de certificado digital de isolamento lógico.
    - Aba de Guia de Deploy & Homologação com comandos de compilação de cache (`config:cache`, `route:cache`, `view:cache`).
### Release v1.0.1 — Interface SaaS Profissional & Limpeza Visual de UX
- **Branch**: `feature/ui-saas-layout-cleanup`
- **Data de Início**: 20/10/2026
- **Data de Conclusão**: 20/10/2026
- **Status**: **Concluída**
- **Versão**: `v1.0.1`
- **Implementações**:
  - **Login Minimalista & Profissional (`LoginPage.tsx` / `LoginForm.tsx`)**:
    - Remoção de todos os termos técnicos (como "TenantScope", "JWT Sanctum", "Critérios de Aceite") da tela inicial.
    - Foco total em conversão e experiência de usuário de igreja: campos de E-mail, Senha e botão de acesso claro.
    - Credenciais de demonstração transformadas em um painel discreto e colapsável ("Ambiente de Testes / Contas Pré-configuradas"), mantendo a facilidade de avaliação sem poluir a interface.
  - **SaaS Application Shell (`AppShell.tsx`)**:
    - Estrutura completa de aplicação comercial com Sidebar vertical fixa e expansível/colapsável.
    - Cabeçalho institucional exibindo o nome e ícone da Igreja ativa, distintivo do perfil do usuário e seletor rápido para igrejas com múltiplas congregações.
    - Menu de navegação claro e categorizado por áreas de atuação:
      - Visão Geral (Dashboard & BI)
      - Administração (Secretaria & Membros, Ministérios & Escalas, Cultos & Eventos, Gestão Financeira)
      - Espaço do Membro (Portal do Membro)
      - Sistema (Segurança & Auditoria, e Gestão de Igrejas para Super Admin)
    - Rodapé com dados do usuário logado, alternador de tema (Claro/Escuro) e botão de encerramento de sessão.
  - **Workspace Focado (`AppPage.tsx`)**:
    - Substituição do antigo harness de testes (`FoundationPage.tsx`) por uma área de trabalho limpa e focada no módulo selecionado.
- **Validação**:
  - Testes automatizados backend com PHPUnit: 67 testes, 392 assertions (100% aprovados).
  - Frontend: `tsc -b && vite build` aprovado sem erros (dist final gerado em 264ms).
  - Validação via navegador com subagente automatizado: login limpo e navegação interna inspecionados com sucesso.

---

## Fase 4 — Frontend Enterprise (React 19 + TypeScript + Tailwind CSS v4)

| Etapa | Descrição | Branch | Status | Versão / Tag |
|---|---|---|---|---|
| **F4-01** | Fundação Frontend (Vite 6, React 19, TS Strict, Tailwind v4, shadcn base, ESLint, Vitest, DevMockAdapter) | `feature/etapa-01-fundacao-frontend` | **Concluída** | `v2.0.0-alpha.1` |
| **F4-02** | Design System & Layouts (Tokens semânticos, Dark/Light, Layouts Admin/Portal/Auth/Platform) | `feature/etapa-02-design-system` | **Concluída** | `v2.0.0-alpha.2` |
| **F4-03** | Autenticação & Navegação Protegida (Login, Sessão Sanctum, Rotas Protegidas, RBAC) | `feature/etapa-03-autenticacao-navegacao` | **Concluída** | `v2.0.0-alpha.3` |
| **F4-04** | Secretaria (Membros, Famílias, Visitantes, Congregações, Aprovações) | `feature/etapa-04-secretaria` | *Planejada* | — |
| **F4-05** | Ministérios & Voluntários (Equipes, Lideranças, Escalas, Conflitos) | `feature/etapa-05-ministerios` | *Planejada* | — |
| **F4-06** | Eventos & Presença (Agenda, Inscrições, Check-in Manual e QR Code) | `feature/etapa-06-eventos-presenca` | *Planejada* | — |
| **F4-07** | Financeiro Avançado (Dízimos, Ofertas, Contas, Lançamentos, Orçamentos, Conciliação) | `feature/etapa-07-financeiro` | *Planejada* | — |
| **F4-08** | Portal do Membro (Autoatendimento Mobile-First, Perfil, Escalas, Avisos) | `feature/etapa-08-portal-membro` | *Planejada* | — |
| **F4-09** | Dashboards Executivos & Relatórios (BI Recharts, Exportações CSV/PDF) | `feature/etapa-09-dashboard-relatorios` | *Planejada* | — |
| **F4-10** | Qualidade, Acessibilidade & Finalização (Testes E2E, Auditoria WCAG, Bundle Optimization) | `feature/etapa-10-testes-finalizacao` | *Planejada* | — |

---

### Etapa F4-01 — Fundação Técnica do Frontend
- **Branch**: `feature/etapa-01-fundacao-frontend`
- **Data de Início**: 21/10/2026
- **Data de Conclusão**: 21/10/2026
- **Status**: **Concluída**
- **Versão**: `v2.0.0-alpha.1`
- **Implementações**:
  - Setup do projeto frontend com Vite 6.4+, React 19.0+ e TypeScript 5.7+ em modo estrito (`strict: true`, `noUnusedLocals`, `noFallthroughCasesInSwitch`).
  - Configuração do Tailwind CSS v4 moderna utilizando `@tailwindcss/vite` e variáveis CSS semânticas `@theme` no padrão HSL.
  - Implementação das primitivas de acessibilidade Radix UI (`Slot`, `Dialog`, `Dropdown`, `Tabs`) integradas ao utilitário `cn` (`clsx` + `tailwind-merge`).
  - Criação dos componentes base de interface: `Button`, `Card`, `Badge` e `Skeleton`.
  - Configuração de Providers centrais: `ThemeProvider` (Dark mode padrão inicial com persistência e toggle para Light mode) e `QueryProvider` (TanStack Query com política de cache desacoplada).
  - Estruturação do cliente HTTP Axios com suporte a cookies stateful do Laravel Sanctum (`withCredentials: true`), proteção CSRF, injeção de `X-Tenant-Id` e interceptores de erro (`ApiError`).
  - Criação do `DevMockAdapter` e fixtures tipadas (`MOCK_USERS`, `MOCK_TENANTS`) ativadas de forma explícita via `VITE_USE_DEV_MOCK=true`.
  - Estruturação modular completa com layouts dedicados: `AdminLayout`, `AuthLayout`, `MemberLayout` e `PlatformLayout`.
  - Documentações técnicas criadas: `frontend/README.md`, `docs/DESIGN-SYSTEM.md`, `docs/API-CONTRACTS.md`, `docs/ROUTES.md`, `docs/TESTING.md`, `docs/DEPLOYMENT.md`.
- **Validação**:
  - `npm run test`: Vitest 2.1+ com 6 testes automatizados cobrindo renderização, alternância de tema, formatadores monetários/data e DevMockAdapter (100% aprovado).
  - `npm run typecheck`: TypeScript `tsc -b --noEmit` aprovado sem erros (100% strict).
  - `npm run lint`: ESLint 9 aprovado com 0 avisos e 0 erros.
  - `npm run build`: Build de produção Vite concluído em 3.20s gerando bundle otimizado (`dist/`).

---

### Etapa F4-02 — Design System e Layouts
- **Branch**: `feature/etapa-02-design-system`
- **Data de Início**: 21/10/2026
- **Data de Conclusão**: 21/10/2026
- **Status**: **Concluída**
- **Versão**: `v2.0.0-alpha.2`
- **Implementações**:
  - **Primitivas shadcn/ui & Radix UI implementadas**:
    - `Input`, `Textarea`, `Label`, `Checkbox`, `Switch`, `Select` (com suporte a grupos, itens e ícones de checagem).
    - `Dialog` (modais acessíveis com backdrop blur e focus trap) e `Sheet` (drawer lateral para navegação móvel e painéis).
    - `DropdownMenu` (com itens de ação, separators, checkbox/radio e atalhos de teclado).
    - `Avatar` (com imagem, fallback de iniciais e anel semântico).
    - `Separator`, `Tabs` (com transições e triggers ativos), `Tooltip`.
  - **Sistema de Notificações Toast (`src/components/feedback/ToastProvider.tsx`)**:
    - Fila de notificações animada com variantes `success`, `error`, `warning`, `info`.
    - Auto-dismiss temporizado e cancelamento manual.
    - Hook ergonômico `useToast`.
  - **Componentes Compartilhados Eclesiásticos**:
    - `MetricKpiCard`: Cartão de indicadores com valor monetário/numérico, ícone estilizado por variante, variação percentual com indicador de subida/descida e estado de skeleton loading proporcional.
    - `EmptyState`: Estado vazio amigável com ícone contextual, título, descrição e botão de ação.
    - `ErrorState`: Tratamento amigável de falhas com botão de tentar novamente (retry) e detalhes de depuração isolados para ambiente DEV.
    - `ConfirmationDialog`: Diálogo de confirmação para ações críticas e exclusões destrutivas.
    - `PageHeader` & `Breadcrumbs`: Cabeçalho unificado com trilha de navegação e área para ações.
  - **Layouts Estruturais Refinados**:
    - `AdminLayout`: Navegação com destaque de rotas ativas, seletor suspenso de congregações/tenants, menu do perfil do pastor/administrador com avatar, gaveta móvel (Sheet) com touch-friendly swipe e alternador de tema escuro/claro.
    - `MemberLayout`: Interface adaptada para smartphones com barra inferior fixa (Início, Agenda, Escalas, Avisos, Perfil), cabeçalho limpo com selo de membro ativo e suporte desktop.
    - `AuthLayout`: Layout com gradiente decorativo, backdrop blur e card responsivo.
    - `PlatformLayout`: Layout de gerenciamento SaaS com badge master e menu de instâncias isolado dos dados de igrejas.
  - **Showcase Interativo**: Página inicial rica demonstrando todos os componentes, formulários, modais, toasts e KPIs.
  - **Otimização de Build & Code Splitting**: Configuração de `manualChunks` em `vite.config.ts` segregando `vendor-react`, `vendor-radix` e `vendor-query`, gerando bundle altamente performático (tempo de build de 1.80s).
- **Validação**:
  - `npm run test`: Vitest com 13 testes automatizados (100% aprovados) cobrindo formulários, modais, confirmações destrutivas, disparos de toasts, estados vazios, estados de erro e KPI skeletons.
  - `npm run typecheck`: TypeScript `tsc -b --noEmit` aprovado sem nenhum erro ou aviso.
  - `npm run lint`: ESLint 9 aprovado com 0 avisos e 0 erros.
  - `npm run build`: Build de produção Vite concluído com sucesso e chunks segregados (`dist/`).

---

### Etapa F4-03 — Autenticação e Navegação Protegida
- **Branch**: `feature/etapa-03-autenticacao-navegacao`
- **Data de Início**: 21/10/2026
- **Data de Conclusão**: 21/10/2026
- **Status**: **Concluída**
- **Versão**: `v2.0.0-alpha.3`
- **Implementações**:
  - **Validação de Formulários com Zod (`src/modules/authentication/schemas.ts`)**:
    - `loginSchema`: Validação de e-mail obrigatório com formato RFC e senha mínima de 6 caracteres.
    - `forgotPasswordSchema`: Validação estrita de e-mail para envio de link de recuperação.
    - `resetPasswordSchema`: Validação de nova senha mínima de 8 caracteres com confirmação idêntica.
  - **Serviço de Autenticação (`src/services/api/authService.ts`)**:
    - Suporte a cookies de sessão e proteção CSRF Sanctum com injeção de `X-Tenant-Id`.
    - Modo DevMockAdapter isolado e dinâmico selecionando perfis reais por e-mail ou botões de acesso rápido.
    - Gerenciamento de tokens, alternância de tenant (`switchTenant`) e limpeza de sessão no logout.
  - **Contexto Global de Sessão (`src/modules/authentication/AuthProvider.tsx`)**:
    - Gerenciamento dos estados `user`, `isAuthenticated`, `isLoading`, `error`.
    - Listener do evento global `churchmanager:unauthorized` (HTTP 401) para expiração graciosa da sessão com aviso visual Toast.
    - Invalidação atômica de cache do TanStack Query no logout e na troca de congregação ativa para prevenir vazamento de dados privados entre tenants.
    - Métodos de autorização de interface: `hasRole(roles)` e `hasPermission(permission)`.
  - **Guarda de Rotas e RBAC (`src/components/shared/ProtectedRoute.tsx`)**:
    - Bloqueio de acessos não autenticados com redirecionamento para `/login` (preservando o caminho de destino no state da navegação).
    - Verificação de papéis autorizados (`allowedRoles`) com redirecionamento imediato para tela de Acesso Negado (`/403`).
    - Skeleton corporativo durante a verificação assíncrona da sessão.
  - **Telas de Autenticação**:
    - `LoginPage`: Formulário com toggle de exibição de senha, bloqueio de submissões duplicadas, feedback de carregamento e painel de atalhos rápidos para contas de teste (Pastor, Secretaria, Tesouraria, Membro).
    - `ForgotPasswordPage`: Formulário com feedback de confirmação de envio e instruções de verificação de caixa postal.
    - `AccessDeniedPage` (403): Explicação clara do motivo do bloqueio, perfil atual do usuário e botão de retorno seguro ao módulo permitido.
  - **Layouts Conectados**:
    - `AdminLayout` e `MemberLayout` integrados com logout real, nome e iniciais do usuário autenticado no avatar e troca dinâmica de congregação.
- **Validação**:
  - `npm run test`: Vitest com 20 testes automatizados em 3 suítes (100% aprovados) cobrindo login, validação Zod, alternância de senha, formulário de recuperação, página 403, ProtectedRoute com papéis concedidos e bloqueio de papéis não autorizados.
  - `npm run typecheck`: TypeScript `tsc -b --noEmit` aprovado sem erros (100% strict).
  - `npm run lint`: ESLint 9 aprovado com 0 avisos e 0 erros.
  - `npm run build`: Build de produção Vite concluído em 3.87s com bundle otimizado (`dist/`).

---

### Etapa F4-04 — Secretaria & Gestão de Membresia
- **Branch**: `feature/etapa-04-secretaria`
- **Data de Início**: 21/10/2026
- **Data de Conclusão**: 21/10/2026
- **Status**: **Concluída**
- **Versão**: `v2.0.0-alpha.4`
- **Implementações**:
  - **Tipagem e Contratos de Domínio (`src/modules/members/types.ts`)**:
    - Entidades `Member`, `Congregation`, `Family`, `Visitor`, `VisitorVisit`, `MemberChangeRequest`, `SecretariaSummaryMetrics`, `MemberFilters`.
  - **Validação de Formulários com Zod (`src/modules/members/schemas.ts`)**:
    - `memberFormSchema`: Validação de dados pessoais, eclesiásticos, vínculos familiares e tutela legal de menores (< 18 anos) em estrita conformidade com a LGPD.
    - `congregationFormSchema`: Validação de sede/filial, liderança pastoral, endereço e dados de contato.
    - `familyFormSchema`: Criação de núcleos familiares com vinculação de responsáveis e membros.
    - `visitorFormSchema` & `visitorVisitFormSchema`: Cadastro de visitantes, canal de contato, histórico e frequência de visitas aos cultos.
    - `reviewChangeRequestSchema`: Validação de aprovação ou rejeição com justificativa obrigatória.
  - **Serviço Desacoplado da API REST (`src/services/api/secretariaService.ts`)**:
    - Endpoints `/api/v1/tenant/members`, `/api/v1/tenant/congregations`, `/api/v1/tenant/families`, `/api/v1/tenant/visitors`, `/api/v1/tenant/change-requests`.
    - Modo DevMockAdapter com stores reativos em memória para desenvolvimento local isolado e testes automatizados.
    - Operação atômica de conversão de visitante em membro oficial preservando o histórico eclesiástico.
  - **Componentes Especializados de Interface (`src/modules/members/components/`)**:
    - `MemberDetailDialog`: Modal com dados cadastrais e eclesiásticos, filiação, histórico de batismo e badge LGPD com alerta de tutela legal para menores de 18 anos.
    - `MemberFormModal`: Formulário modular com detecção reativa em tempo real de data de nascimento de menores de idade, exibindo dinamicamente campos obrigatórios de responsável legal (`legalGuardianName`, `legalGuardianPhone`).
    - `MembersTab`: Barra de filtros inteligentes (busca textual, congregação, status de membresia e alternador de menores LGPD), tabela responsiva com avatares e iniciais, status badges e diálogo de confirmação de exclusão segura.
    - `FamiliesTab`: Cartões de núcleos familiares, indicação do chefe de família, badges dos integrantes e modal de cadastro de famílias.
    - `VisitorsTab`: Gestão de visitantes, registro de visitas subsequentes e conversão atômica de visitante em membro oficial com feedback comemorativo Toast.
    - `CongregationsTab`: Listagem hierárquica distinguindo Congregação Sede (badge dourado/destaque) e Filiais, contagem de membros ativos, dados de contato e modal de nova congregação.
    - `ChangeRequestsTab`: Gestão de solicitações de alteração cadastral enviadas pelo Portal do Membro com comparativo visual antes/depois (diff de alterações com destaque verde e tachado) e aprovação/rejeição com justificativa obrigatória.
  - **Página Orquestradora (`src/modules/members/pages/SecretariaPage.tsx`)**:
    - Painel integrado com 6 cartões de KPI (Total de Membros, Membros Ativos, Menores de Idade LGPD, Congregações, Visitantes Ativos, Solicitações Pendentes).
    - Navegação fluida via Radix Tabs (`members`, `congregations`, `families`, `visitors`, `requests`), gerenciamento de mutações com invalidação atômica de cache via TanStack Query e notificações Toast.
  - **Roteamento Conectado (`src/app/router/routes.tsx`)**:
    - Rota `/admin/members` configurada como rota filha do `AdminLayout` protegida por papéis autorizados (`church_admin`, `pastor`, `secretary`).
- **Validação**:
  - `npm run test`: Vitest com 27 testes automatizados em 4 suítes (100% aprovados) cobrindo renderização, filtros, formulários com detecção LGPD de menores, conversão atômica de visitantes, comparativo antes/depois e aprovação cadastral.
  - `npm run typecheck`: TypeScript `tsc -b --noEmit` aprovado sem erros (100% strict).
  - `npm run lint`: ESLint 9 aprovado com 0 avisos e 0 erros (`--max-warnings 0`).
  - `npm run build`: Build de produção Vite concluído em 4.05s com bundle otimizado (`dist/`).

---

### Etapa F4-05 — Ministérios & Voluntários
- **Branch**: `feature/etapa-05-ministerios`
- **Data de Início**: 21/10/2026
- **Data de Conclusão**: 21/10/2026
- **Status**: **Concluída**
- **Versão**: `v2.0.0-alpha.5`
- **Implementações**:
  - **Tipagem e Contratos de Domínio (`src/modules/ministries/types.ts`)**:
    - Entidades `Ministry`, `MinistryRole`, `MinistryVolunteer`, `Schedule`, `ScheduleVolunteer`, `ScheduleConflict`, `MinistrySummaryMetrics`, `ScheduleFilters`.
  - **Validação de Formulários e Prevenção de Conflitos (`src/modules/ministries/schemas.ts`)**:
    - `ministryFormSchema`: Validação de nome, descrição, cor de identificação e líder ministerial.
    - `ministryRoleFormSchema`: Cadastro de papéis e funções especializadas por ministério (ex: Baterista, Professora de Classe).
    - `volunteerAssignFormSchema`: Alocação de membro e definição de status e data de ingresso.
    - `scheduleFormSchema`: Escala de serviço com array dinâmico de voluntários e funções para a data.
    - `scheduleResponseSchema`: Resposta do voluntário (confirmar, recusar com justificativa obrigatória ou solicitar substituição indicando outro membro).
    - `isTimeIntervalOverlapping`: Algoritmo matemático para detecção de interseção de intervalos de horário `(startA < endB && endA > startB)`.
  - **Serviço Desacoplado da API REST (`src/services/api/ministryService.ts`)**:
    - Endpoints `/api/v1/tenant/ministries`, `/api/v1/tenant/schedules`, `/api/v1/tenant/schedules/check-conflicts`, publicação de escalas e confirmação/recusa de presença.
    - Modo DevMockAdapter com stores reativos em memória e método `resetMockStores()` para isolamento de testes automatizados.
  - **Componentes Especializados de Interface (`src/modules/ministries/components/`)**:
    - `ScheduleConflictAlert`: Alerta visual, chamativo e em tempo real exibido no modal de escala caso haja sobreposição de horário para qualquer um dos voluntários selecionados na mesma data.
    - `ScheduleFormModal`: Formulário de criação/edição de escala com `useWatch` e `useFieldArray`, cálculo reativo em tempo real de conflitos de horário e alerta preventivo.
    - `VolunteerResponseModal`: Modal de resposta do voluntário com confirmação de presença, recusa com justificativa obrigatória e indicação de substituto.
    - `SchedulesTab`: Grade de cartões de escalas com timeline, badges de confirmação de voluntários, filtros de busca/ministério e ações de publicar ou excluir.
    - `MinistriesTab`: Cartões de ministérios com banner na cor do departamento, dados do líder e modal de novas funções/papéis.
    - `VolunteersTab`: Tabela de voluntários com filtro por departamento e modal de alocação de novos voluntários.
    - `PresenceResponsesTab`: Central de confirmações de escalas com ação direta de confirmação e modal para alteração de resposta.
  - **Página Orquestradora (`src/modules/ministries/pages/MinistriesPage.tsx`)**:
    - Painel integrado com 5 cartões de KPI (Total de Ministérios, Voluntários Ativos, Escalas Publicadas, Confirmações Pendentes, Presenças Confirmadas).
    - Navegação com 4 abas (`schedules`, `ministries`, `volunteers`, `responses`), integração com TanStack Query e notificações Toast.
  - **Roteamento Conectado (`src/app/router/routes.tsx`)**:
    - Rota `/admin/ministries` configurada como rota filha do `AdminLayout` protegida por papéis autorizados (`church_admin`, `pastor`, `secretary`, `leader`).
- **Validação**:
  - `npm run test`: Vitest com 34 testes automatizados em 5 suítes (100% aprovados), cobrindo KPIs, listagem de escalas, departamentos e funções, alerta chamativo de conflito de horário em tempo real, filtro de voluntários, confirmação de presença e recusa com justificativa obrigatória.
  - `npm run typecheck`: TypeScript `tsc -b --noEmit` aprovado sem erros (100% strict).
  - `npm run lint`: ESLint 9 aprovado com 0 avisos e 0 erros (`--max-warnings 0`).
  - `npm run build`: Build de produção Vite concluído em 4.75s com bundle otimizado (`dist/`).








