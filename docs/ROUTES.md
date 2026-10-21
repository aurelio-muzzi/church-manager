# ChurchManager — Estrutura de Rotas e Layouts

Mapeamento completo das rotas frontend e seus respectivos layouts associados.

---

## 1. Mapeamento de Layouts

1. **`AuthLayout`**: Rotas públicas de autenticação, recuperação de senha e onboarding inicial.
2. **`AdminLayout`**: Gestão administrativa interna da igreja (Pastores, Secretários, Tesoureiros, Líderes).
3. **`MemberLayout`**: Portal restrito de autoatendimento do membro com navegação simplificada e barra inferior mobile.
4. **`PlatformLayout`**: Gestão corporativa do SaaS (Master Admin da Plataforma), isolada dos dados eclesiásticos.

---

## 2. Mapa de Rotas

```text
/                                    -> Página inicial / Showcase
/login                               -> AuthLayout: Formulário de Login seguro
/recuperar-senha                     -> AuthLayout: Solicitação de recuperação

/platform                            -> PlatformLayout: Overview SaaS
/platform/tenants                    -> PlatformLayout: Gestão de Igrejas
/platform/tenants/:tenantId          -> PlatformLayout: Detalhes e status operacional

/admin                               -> AdminLayout: Redireciona para /admin/dashboard
/admin/dashboard                     -> AdminLayout: Dashboard executivo
/admin/members                       -> AdminLayout: Secretaria e gestão de membros
/admin/families                      -> AdminLayout: Gestão familiar
/admin/visitors                      -> AdminLayout: Visitantes e integração
/admin/congregations                 -> AdminLayout: Sedes e congregações
/admin/ministries                    -> AdminLayout: Departamentos e voluntários
/admin/events                        -> AdminLayout: Agenda e eventos
/admin/attendance                    -> AdminLayout: Presença manual e QR Code
/admin/finance                       -> AdminLayout: Financeiro avançado
/admin/reports                       -> AdminLayout: Relatórios gerenciais
/admin/settings                      -> AdminLayout: Configurações do tenant

/portal                              -> MemberLayout: Início do Portal
/portal/profile                      -> MemberLayout: Perfil e solicitações cadastrais
/portal/events                       -> MemberLayout: Agenda e inscrições
/portal/schedules                    -> MemberLayout: Minhas escalas e confirmações
/portal/attendance                   -> MemberLayout: Histórico de presenças
/portal/announcements                -> MemberLayout: Comunicados da igreja
```
