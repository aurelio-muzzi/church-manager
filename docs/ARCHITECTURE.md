# ChurchManager — Documentação de Arquitetura

## 1. Visão Geral
O **ChurchManager** é uma plataforma web multi-tenant projetada para atender igrejas evangélicas de qualquer porte, permitindo gestão de congregações, membros, famílias, visitantes, ministérios, eventos, voluntários, escalas, presenças manuais e via QR Code, finanças completas (dízimos, ofertas, despesas, conciliação manual e orçamentos) e um portal exclusivo para o membro.

## 2. Tecnologias e Versões
- **Backend**: Laravel 11.x (PHP 8.4+)
- **Autenticação**: Laravel Sanctum (Tokens seguros / SPA Statefull)
- **Frontend**: React 19 + TypeScript + Vite + Lucide Icons + React Router
- **Banco de Dados**: MySQL 8.0 (com isolamento lógico multi-tenant)
- **Contêineres**: Docker & Docker Compose
- **Fuso Horário Padrão**: `America/Manaus` (configurável por tenant)

## 3. Modelo de Isolamento Multi-Tenant
Na primeira versão, a estratégia adotada é:
- **Banco compartilhado** com isolamento lógico obrigatório.
- Todas as tabelas de domínio contêm `tenant_id` (UUID ou BigInteger indexado) com chave estrangeira para a tabela `tenants`.
- `TenantScope` global do Eloquent aplicado centralmente nos Models.
- **Validação de Tenant no Backend**: O backend nunca confia cegamente no `tenant_id` recebido no request; o tenant ativo é extraído estritamente da identidade autenticada e sua associação autorizada.
- Resolução e validação de tenant através de Middleware (`IdentifyTenant`).
- Proteção contra manipulação de IDs e travessia entre tenants em todas as queries e rotas.

## 4. Estrutura do Repositório
```text
church-manager/
├── backend/            # API REST Laravel 11
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/v1/
│   │   │   ├── Middleware/
│   │   │   └── Requests/
│   │   ├── Models/
│   │   ├── Policies/
│   │   └── Services/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   └── tests/
├── frontend/           # SPA React + TypeScript
│   ├── public/
│   ├── src/
│   │   ├── components/ # Componentes reutilizáveis (UI, Skeletons, Layouts)
│   │   ├── contexts/   # AuthContext, ThemeContext, TenantContext
│   │   ├── hooks/      # Hooks customizados
│   │   ├── pages/      # Telas administrativas e do portal do membro
│   │   ├── services/   # Clientes API Axios / Fetch tipados
│   │   ├── types/      # Contratos e tipos TypeScript
│   │   └── App.tsx
├── docker/             # Configurações Docker
│   ├── backend/
│   │   └── Dockerfile
│   ├── frontend/
│   │   └── Dockerfile
│   └── mysql/
├── docs/               # Documentação técnica e progresso
├── docker-compose.yml
└── README.md
```

## 5. Diretrizes de UI/UX
- **Design System Mobile-First**: Otimizado para smartphones, tablets e desktops.
- **Tema**: Modo escuro (*Dark Mode*) como padrão de alta fidelidade visual, com suporte e alternância para modo claro (*Light Mode*) persistido no `localStorage`.
- **Skeletons**: Indicadores de carregamento para todas as tabelas, formulários e cartões informativos.
- **Feedback**: Notificações toast e validação de formulários amigável.
