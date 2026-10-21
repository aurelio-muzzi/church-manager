# ChurchManager — Build e Implantação do Frontend

Instruções para geração do bundle de produção e deploy estático do frontend SPA.

---

## 1. Geração do Bundle de Produção

```bash
cd frontend
npm run build
```

O comando executa `tsc -b && vite build`, gerando os arquivos estáticos otimizados no diretório `dist/`.

---

## 2. Configurações de Servidor Web (Nginx / Caddy / Apache)

Por ser uma Single Page Application (SPA), todas as requisições que não apontarem para arquivos estáticos existentes devem ser reescritas para `index.html`.

### Exemplo Nginx:
```nginx
server {
    listen 80;
    server_name app.churchmanager.com;
    root /var/www/churchmanager/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
