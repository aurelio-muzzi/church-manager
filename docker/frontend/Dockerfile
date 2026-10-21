FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["sh", "-c", "if [ ! -d node_modules/@tailwindcss ]; then echo 'Instalando dependencias do Node...' && npm install; fi && npm run dev -- --host 0.0.0.0 --port 5173"]
