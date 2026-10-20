# ChurchManager

> **Plataforma Multi-Tenant de Gestão de Igrejas Evangélicas**

O **ChurchManager** é uma aplicação web completa projetada para atender igrejas evangélicas de todos os portes com padrão profissional de engenharia, isolamento rigoroso multi-tenant, controle de membros e famílias, ministérios e voluntários, eventos com check-in via QR Code, módulo financeiro transacional auditável e portal do membro.

---

## 🛠️ Tecnologias Principais

- **Backend**: [Laravel 11](https://laravel.com/) (PHP 8.4+) com arquitetura em camadas e [Sanctum](https://laravel.com/docs/sanctum).
- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/) + [Lucide Icons](https://lucide.dev/).
- **Banco de Dados**: MySQL 8.0 com isolamento lógico multi-tenant.
- **Design System**: Mobile-First, Dark Mode por padrão com suporte a Light Mode, Skeletons de carregamento.
- **Contêineres**: Docker & Docker Compose.
- **Fuso Horário Padrão**: `America/Manaus`.

---

## 🚀 Como Executar

Consulte o [Guia de Instalação Detalhado](docs/INSTALLATION.md).

### Início Rápido via Docker

```bash
docker compose up -d --build
```
Acesse o sistema em `http://localhost:5173`.

---

## 🗺️ Roadmap de Implementação

| Etapa | Módulo | Status |
|---|---|---|
| **01** | Fundação (Laravel, React+TS, Docker, MySQL, Testes) | **Concluída (`v0.1.0`)** |
| **02** | Multi-Tenancy e Segurança (Isolamento, Sanctum, Roles) | **Concluída (`v0.2.0`)** |
| **03** | Secretaria (Membros, Famílias, Visitantes, Congregações) | Próxima |

| **04** | Ministérios e Voluntários | Pendente |
| **05** | Eventos e Presença (Manual e QR Code) | Pendente |
| **06** | Financeiro Avançado (Dízimos, Ofertas, Despesas, Orçamento) | Pendente |
| **07** | Portal do Membro | Pendente |
| **08** | Dashboard e Relatórios | Pendente |
| **09** | Auditoria e Preparação para Produção | Pendente |

---

## 📖 Documentação

- [Arquitetura do Sistema](docs/ARCHITECTURE.md)
- [Guia de Instalação](docs/INSTALLATION.md)
- [Registro de Progresso (PROGRESS.md)](docs/PROGRESS.md)
