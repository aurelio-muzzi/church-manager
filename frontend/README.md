# ChurchManager — Frontend Enterprise

Interface web profissional e moderna para gestão eclesiástica evangélica multi-tenant, desenvolvida com React 19, TypeScript estrito, Tailwind CSS v4 e ecossistema de alta produtividade.

---

## 1. Tecnologias Principais

- **Core**: React 19 (Strict Mode) + TypeScript 5.7+
- **Build Tool**: Vite 6+
- **Estilos**: Tailwind CSS v4 (`@tailwindcss/vite` + `@theme` CSS Variables)
- **Componentes**: Primitivas acessíveis Radix UI + shadcn/ui patterns (`class-variance-authority`, `clsx`, `tailwind-merge`)
- **Ícones**: Lucide React
- **Navegação**: React Router 7+
- **Gerenciamento de Cache Remoto**: TanStack Query (React Query)
- **Formulários**: React Hook Form + Zod
- **Tabelas Complexas**: TanStack Table
- **Gráficos e BI**: Recharts
- **Manipulação de Datas**: date-fns (Fuso padrão: `America/Manaus`)
- **Qualidade**: ESLint 9 + Prettier
- **Testes**: Vitest + Testing Library + jsdom

---

## 2. Estrutura de Diretórios

```text
frontend/
├── public/                # Assets públicos estáticos (favicon, manifest, ícones)
├── src/
│   ├── app/               # Providers centrais, inicialização e router
│   ├── assets/            # Imagens e vetores locais
│   ├── components/        # Componentes reutilizáveis (ui, shared, feedback)
│   ├── layouts/           # Layouts de página (Admin, Auth, Member, Platform)
│   ├── modules/           # Módulos funcionais de negócio
│   ├── services/          # Cliente HTTP Axios, adaptadores e fixtures
│   ├── hooks/             # Custom React Hooks
│   ├── lib/               # Utilitários (cn, formatters)
│   ├── types/             # Tipagens TypeScript globais
│   ├── utils/             # Helpers e cálculos
│   ├── styles/            # CSS global e tokens de tema Tailwind v4
│   ├── main.tsx           # Ponto de entrada
│   └── vite-env.d.ts      # Tipos de variáveis de ambiente
├── tests/                 # Configurações de testes e suites
├── .env.example           # Variáveis de ambiente de exemplo
├── components.json        # Configuração do shadcn/ui
├── package.json           # Dependências e scripts
├── tsconfig.json          # Configuração de TypeScript estrito
└── vite.config.ts         # Configuração do Vite e plugins
```

---

## 3. Instruções de Execução

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000`.

### Verificação de Tipos
```bash
npm run typecheck
```

### Testes Automatizados
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Build de Produção
```bash
npm run build
```

---

## 4. Variáveis de Ambiente

Consulte o arquivo `.env.example`:
- `VITE_API_BASE_URL`: Caminho base da API REST (`/api/v1`).
- `VITE_USE_DEV_MOCK`: Ativa/desativa o adaptador isolado de desenvolvimento (`true`/`false`).
- `VITE_DEFAULT_TIMEZONE`: Fuso horário padrão da congregação (`America/Manaus`).
