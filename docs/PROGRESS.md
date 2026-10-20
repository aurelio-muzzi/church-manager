# ChurchManager — Registro de Progresso

Documento de acompanhamento da evolução do projeto **ChurchManager**, seguindo as diretrizes de engenharia de software e controle rigoroso de branches Git.

---

## Tabela de Etapas

| Etapa | Descrição | Branch | Status | Versão / Tag |
|---|---|---|---|---|
| **01** | Fundação técnica (Laravel, React+TS, Docker, padrões, testes base) | `feature/etapa-01-fundacao` | **Concluída** | `v0.1.0` |
| **02** | Multi-tenancy e Segurança (Isolamento de tenants, Auth Sanctum, Roles/Policies) | `feature/etapa-02-multitenancy-seguranca` | **Concluída** | `v0.2.0` |
| **03** | Secretaria (Membros, Famílias, Visitantes, Congregações, Aprovações) | `feature/etapa-03-secretaria` | **Concluída** | `v0.3.0` |
| **04** | Ministérios e Voluntários (Departamentos, Equipes, Lideranças, Escalas) | `feature/etapa-04-ministerios-voluntarios` | Próxima | `v0.4.0` |
| **05** | Eventos e Presença (Cultos, Eventos, Inscrições, Check-in Manual e QR Code) | `feature/etapa-05-eventos-presenca` | Pendente | `v0.5.0` |
| **06** | Financeiro Avançado (Contas, Categorias, Dízimos/Ofertas, Despesas, Orçamentos, Conciliação) | `feature/etapa-06-financeiro` | Pendente | `v0.6.0` |
| **07** | Portal do Membro (Perfil, Solicitações, Escalas, Eventos, Avisos, Histórico) | `feature/etapa-07-portal-membro` | Pendente | `v0.7.0` |
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
- **Validação**:
  - Testes automatizados com PHPUnit: 14 testes, 56 assertions (100% aprovados), cobrindo tentativas de vazamento entre tenants, bloqueio de igrejas suspensas, autorização do platform admin e integridade de senhas nos logs.
  - Frontend: `tsc -b && vite build` sem erros ou avisos (100% aprovado).


