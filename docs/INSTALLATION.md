# ChurchManager — Guia de Instalação e Execução

Este guia descreve os passos para configurar e executar o ambiente do **ChurchManager** em desenvolvimento local ou utilizando Docker.

---

## 1. Requisitos de Ambiente

- **PHP**: 8.4+ com extensões `pdo_mysql`, `mbstring`, `openssl`, `bcmath`, `curl`, `zip`, `gd`.
- **Composer**: 2.8+
- **Node.js**: 20+ ou 24+ LTS (com NPM)
- **MySQL**: 8.0+
- **Docker & Docker Compose**: Versão recente (opcional se executado nativamente)
- **Git**: 2.40+

---

## 2. Execução com Docker (Recomendado)

O projeto possui orquestração completa via Docker Compose:

1. Clone o repositório e acesse a raiz:
   ```bash
   cd church-manager
   ```

2. Copie o arquivo de variáveis de ambiente:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

3. Suba os contêineres:
   ```bash
   docker compose up -d --build
   ```

4. Execute as migrations e gere a chave da aplicação:
   ```bash
   docker compose exec app php artisan key:generate
   docker compose exec app php artisan migrate
   ```

5. Acesse os serviços:
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## 3. Execução Nativa Local

### Backend (Laravel 11)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --port=8000
```

### Frontend (React + TypeScript + Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 4. Testes Automatizados

### Backend (PHPUnit)
```bash
cd backend
php artisan test
```

### Frontend (TypeScript & Build)
```bash
cd frontend
npm run build
```
