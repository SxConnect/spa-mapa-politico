# Flixly Template - Restaurante
# Multi-stage build para imagem otimizada

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar TODAS as dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte E arquivo .env
COPY . .

# Build do frontend (Vite vai ler as variáveis do .env)
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --only=production

# Copiar build do frontend
COPY --from=builder /app/dist ./dist

# Copiar servidor
COPY server ./server

# Criar diretórios necessários
RUN mkdir -p data public/uploads

# Expor porta
EXPOSE 3001

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Iniciar servidor
CMD ["node", "server/index.js"]
