# ChurchManager — Contratos de Integração com a API REST

Documentação formal dos contratos consumidos pelo frontend React a partir do backend Laravel 11.

---

## 1. Padrões Globais

- **Prefixo Base**: `/api/v1`
- **Autenticação**: Laravel Sanctum via cookies com proteção CSRF (`/sanctum/csrf-cookie`)
- **Headers Obrigatórios**:
  - `Accept: application/json`
  - `Content-Type: application/json`
  - `X-Requested-With: XMLHttpRequest`
  - `X-Tenant-Id: <uuid_ou_slug>` (injetado via interceptor para requisições com escopo de tenant)
- **Fuso Horário Oficial**: `America/Manaus`

---

## 2. Resumo dos Endpoints por Domínio

### 2.1. Autenticação e Sessão
- `POST /api/v1/auth/login` → Credenciais (`email`, `password`) → Retorna usuário autenticado e permissões.
- `POST /api/v1/auth/logout` → Invalida sessão e cookies.
- `GET /api/v1/auth/me` → Dados do usuário atual e tenant ativo.
- `POST /api/v1/auth/switch-tenant` → Alterna tenant ativo para usuários autorizados.

### 2.2. Gestão Global de Tenants (Platform Admin)
- `GET /api/v1/platform/tenants` → Listagem paginada de congregações.
- `POST /api/v1/platform/tenants` → Provisionamento de nova igreja.
- `GET /api/v1/platform/tenants/{tenant}` → Detalhes operacionais.
- `PATCH /api/v1/platform/tenants/{tenant}/status` → Ativação/suspensão de tenant.

### 2.3. Secretaria
- `GET|POST /api/v1/tenant/congregations`
- `GET|POST|PUT|DELETE /api/v1/tenant/members`
- `GET|POST|PUT|DELETE /api/v1/tenant/families`
- `GET|POST /api/v1/tenant/visitors`
- `POST /api/v1/tenant/visitors/{visitor}/convert-to-member`
- `GET /api/v1/tenant/change-requests`
- `POST /api/v1/tenant/change-requests/{changeRequest}/review`

### 2.4. Ministérios e Escalas
- `GET|POST|PUT|DELETE /api/v1/tenant/ministries`
- `POST /api/v1/tenant/schedules/check-conflicts`
- `GET|POST /api/v1/tenant/schedules`
- `POST /api/v1/tenant/schedules/{schedule}/respond`

### 2.5. Eventos e Presença
- `GET|POST /api/v1/tenant/events`
- `POST /api/v1/tenant/events/{event}/registrations`
- `POST /api/v1/tenant/events/{event}/check-in` (Manual e via QR Code)
- `GET /api/v1/tenant/events/{event}/stats`

### 2.6. Financeiro Avançado
- `GET|POST /api/v1/tenant/financial-accounts`
- `GET|POST /api/v1/tenant/financial-categories`
- `GET|POST /api/v1/tenant/financial-transactions`
- `POST /api/v1/tenant/financial-transactions/{financialTransaction}/reconcile`
- `GET /api/v1/tenant/financial-reports/summary`
- `GET|POST /api/v1/tenant/financial-budgets`

### 2.7. Portal do Membro
- `GET /api/v1/tenant/member-portal/dashboard`
- `GET /api/v1/tenant/member-portal/profile`
- `POST /api/v1/tenant/member-portal/profile/update-request`
- `GET /api/v1/tenant/member-portal/schedules`
- `POST /api/v1/tenant/member-portal/schedules/{scheduleVolunteer}/respond`
- `GET /api/v1/tenant/member-portal/events`
- `POST /api/v1/tenant/member-portal/events/{event}/register`
- `GET /api/v1/tenant/member-portal/contributions`
- `GET /api/v1/tenant/member-portal/prayer-requests`
- `POST /api/v1/tenant/member-portal/prayer-requests`
- `GET /api/v1/tenant/member-portal/notices`

### 2.8. Dashboard Executivo e Exportação
- `GET /api/v1/tenant/dashboard/executive`
- `GET /api/v1/tenant/dashboard/demographics`
- `GET /api/v1/tenant/dashboard/financial-evolution`
- `GET /api/v1/tenant/dashboard/export/members`
- `GET /api/v1/tenant/dashboard/export/financial`
- `GET /api/v1/tenant/dashboard/export/attendance`
