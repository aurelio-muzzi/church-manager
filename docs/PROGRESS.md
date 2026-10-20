# ChurchManager — Registro de Progresso

Documento de acompanhamento da evolução do projeto **ChurchManager**, seguindo as diretrizes de engenharia de software e controle rigoroso de branches Git.

---

## Tabela de Etapas

| Etapa | Descrição | Branch | Status | Versão / Tag |
|---|---|---|---|---|
| **01** | Fundação técnica (Laravel, React+TS, Docker, padrões, testes base) | `feature/etapa-01-fundacao` | **Concluída** | `v0.1.0` |
| **02** | Multi-tenancy e Segurança (Isolamento de tenants, Auth Sanctum, Roles/Policies) | `feature/etapa-02-multitenancy-seguranca` | Próxima | `v0.2.0` |
| **03** | Secretaria (Membros, Famílias, Visitantes, Congregações, Aprovações) | `feature/etapa-03-secretaria` | Pendente | `v0.3.0` |
| **04** | Ministérios e Voluntários (Departamentos, Equipes, Lideranças, Escalas) | `feature/etapa-04-ministerios-voluntarios` | Pendente | `v0.4.0` |
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
- **Implementações**:
  - Repositório Git com branches `main`, `develop` e `feature/etapa-01-fundacao`.
  - Backend Laravel 11 com PHP 8.4, estruturado para API REST sob prefixo `/api/v1`.
  - Laravel Sanctum configurado para autenticação de tokens e sessões SPA.
  - Endpoint de verificação `/api/v1/health` retornando status operacional, versão, fuso horário (`America/Manaus`) e status de banco.
  - Testes automatizados do backend com PHPUnit (Feature `HealthCheckTest`).
  - Frontend React + TypeScript com Vite, Lucide Icons, Mobile First e Dark Mode padrão com persistência local.
  - Skeletons fluidos para carregamento assíncrono.
  - Configuração do Docker Compose (backend PHP 8.4, frontend Vite, MySQL 8.0 com healthcheck).
  - Guia de Instalação (`docs/INSTALLATION.md`) e Arquitetura (`docs/ARCHITECTURE.md`).
- **Validação**:
  - Testes backend: 3 testes, 11 assertions (100% aprovados).
  - Frontend: `tsc -b && vite build` sem erros ou avisos (100% aprovado).

