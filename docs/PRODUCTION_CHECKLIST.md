# ChurchManager — Checklist e Homologação de Produção v1.0.0

Este documento formaliza as validações e requisitos técnicos para entrada em produção da plataforma **ChurchManager**, garantindo conformidade com os mais rigorosos padrões de segurança, privacidade de dados e engenharia de software.

---

## 1. Segurança & Headers HTTP

- [x] **X-Frame-Options: DENY**: Proteção completa contra ataques de *clickjacking*.
- [x] **X-Content-Type-Options: nosniff**: Prevenção estrita contra *MIME-sniffing*.
- [x] **X-XSS-Protection: 1; mode=block**: Proteção ativada para navegadores legados.
- [x] **Referrer-Policy: strict-origin-when-cross-origin**: Ocultação de dados de navegação sensíveis.
- [x] **Permissions-Policy**: Desativação de permissões desnecessárias do dispositivo (`camera=(), microphone=(), geolocation=()`).
- [x] **Content-Security-Policy (CSP)**: Políticas restritivas de origens de script, estilo e conexões.
- [x] **Remoção de Headers Reveladores**: Remoção do header `X-Powered-By` para mitigar reconhecimento de versão do backend.
- [x] **Rate Limiting / Throttling**:
  - `throttle:auth`: Limite estrito de 15 requisições/minuto para proteção contra ataques de dicionário e força bruta em `/api/v1/auth/login`.
  - `throttle:checkin`: Limite de 40 requisições/minuto para autoatendimento e check-in.
  - `throttle:api`: Limite global de 120 requisições/minuto por usuário/IP.

---

## 2. Isolamento Lógico Multi-Tenant

- [x] **Eloquent Global TenantScope**: Todas as entidades de domínio possuem isolamento automático forçado via `BelongsToTenant`.
- [x] **Injeção Centralizada de Tenant**: O `tenant_id` é sempre injetado via contexto autenticado (`TenantContext`), ignorando qualquer valor passado no corpo da requisição.
- [x] **Middleware IdentifyTenant**: Bloqueio 403 para usuários que tentam forjar acesso a igrejas das quais não fazem parte.
- [x] **Prevenção de Vazamento Cruzado (Cross-Tenant)**: Testes de penetração automatizados validam que 0% dos registros de outro tenant são expostos em endpoints REST, dashboards e exportações CSV.
- [x] **Trilha de Auditoria (Audit Logs)**: Toda alteração cadastral, suspensão de congregação e autoteste de isolamento é registrado em `audit_logs` com sanitização compulsória de credenciais.

---

## 3. Conformidade LGPD & Proteção de Dados

- [x] **Detecção de Menores de Idade (`is_minor`)**: Cálculo automático com base na data de nascimento (`birth_date`), exigindo contato de emergência/responsável legal.
- [x] **Sanitização de Logs**: O serviço `AuditService` redige automaticamente campos como `password`, `token`, `secret` antes de qualquer gravação de log.
- [x] **Direito ao Acesso e Extrato**: Módulo Portal do Membro permitindo visualização de extrato anual de dízimos/ofertas e histórico de dados cadastrais.
- [x] **Confidencialidade Pastoral**: Pedidos de oração marcados como confidenciais são restritos exclusivamente aos pastores e equipe de intercessão autorizada.

---

## 4. Otimização & Performance para Nuvem

- [x] **Compilação de Caches**:
  ```bash
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  php artisan event:cache
  ```
- [x] **Prevenção de N+1 Queries**: Ativação de `Model::preventLazyLoading` em ambientes de desenvolvimento e testes.
- [x] **Frontend Otimizado**: Bundle de produção gerado via Vite em ~300ms com minificação, code splitting e árvore de módulos limpa.
- [x] **Exportações com UTF-8 BOM**: Arquivos CSV gerados com cabeçalho `\xEF\xBB\xBF` e separador `;` para compatibilidade imediata com Microsoft Excel e Google Planilhas.

---

## 5. Resumo da Suíte de Testes Automatizados

| Módulo Testado | Arquivo de Teste | Qtd. Testes | Status |
|---|---|---|---|
| Autenticação & Tokens | `AuthTest.php` | 5 testes | **Aprovado** |
| Multi-Tenancy & Segurança | `MultiTenancySecurityTest.php` | 6 testes | **Aprovado** |
| Secretaria & Membros | `SecretaryTest.php` | 6 testes | **Aprovado** |
| Ministérios & Escalas | `MinistryScheduleTest.php` | 7 testes | **Aprovado** |
| Eventos & Presença QR | `EventAttendanceTest.php` | 8 testes | **Aprovado** |
| Financeiro Avançado | `FinancialModuleTest.php` | 9 testes | **Aprovado** |
| Portal do Membro | `MemberPortalTest.php` | 9 testes | **Aprovado** |
| Dashboard Executivo BI | `DashboardReportTest.php` | 9 testes | **Aprovado** |
| Auditoria de Produção | `ProductionAuditTest.php` | 5 testes | **Aprovado** |
| Health Check & Base | `HealthCheckTest.php` + `ExampleTest.php` | 3 testes | **Aprovado** |
| **TOTAL CONSOLIDADO** | **10 Suítes de Teste** | **67 testes (392 assertions)** | **100% APROVADO** |
