# 🚀 Configuração Traefik - SPA Mapa Político

## 📋 O que é Traefik?

Traefik é um proxy reverso moderno que:
- ✅ Gera certificados SSL automaticamente (Let's Encrypt)
- ✅ Roteamento automático baseado em labels
- ✅ Load balancing
- ✅ Middlewares de segurança
- ✅ Dashboard de monitoramento

## 🔧 Pré-requisitos

1. **Docker e Docker Compose** instalados
2. **Domínio configurado** apontando para seu servidor
3. **Portas 80 e 443** liberadas no firewall

## 📦 Passo 1: Configurar Traefik

### 1.1 Criar rede do Traefik

```bash
docker network create traefik-network
```

### 1.2 Criar arquivo de configuração do Traefik

Crie `traefik.yml`:

```yaml
# traefik.yml
api:
  dashboard: true
  debug: true

entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: traefik-network

certificatesResolvers:
  letsencrypt:
    acme:
      tlsChallenge: {}
      email: seu-email@dominio.com
      storage: /letsencrypt/acme.json
      # Para teste, use o servidor de staging:
      # caServer: https://acme-staging-v02.api.letsencrypt.org/directory
```

### 1.3 Criar docker-compose do Traefik

Crie `docker-compose.traefik-server.yml`:

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    container_name: traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"  # Dashboard (remover em produção)
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/traefik.yml:ro
      - ./letsencrypt:/letsencrypt
    networks:
      - traefik-network
    labels:
      # Dashboard do Traefik (opcional)
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(`traefik.seudominio.com`)"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.tls=true"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik.service=api@internal"
      # Autenticação básica (opcional)
      - "traefik.http.routers.traefik.middlewares=auth"
      - "traefik.http.middlewares.auth.basicauth.users=admin:$$2y$$10$$..."  # htpasswd

networks:
  traefik-network:
    external: true
```

### 1.4 Iniciar Traefik

```bash
# Criar diretório para certificados
mkdir letsencrypt
chmod 600 letsencrypt

# Iniciar Traefik
docker-compose -f docker-compose.traefik-server.yml up -d
```

## 🌐 Passo 2: Deploy do Mapa Político com Traefik

### 2.1 Usar arquivo específico para Traefik

Use o arquivo `docker-compose.traefik.yml`:

```bash
# Configurar variáveis de ambiente
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=SuaSenhaSegura123!

# Deploy
docker-compose -f docker-compose.traefik.yml up -d
```

### 2.2 Configurar domínio

**IMPORTANTE:** Altere `mapa.seudominio.com` para seu domínio real nas labels:

```yaml
labels:
  - "traefik.http.routers.mapa-https.rule=Host(`mapa.seudominio.com`)"
```

## 🔐 Passo 3: Configurações de Segurança

### 3.1 Labels de Segurança Explicadas

```yaml
# Headers de segurança
- "traefik.http.middlewares.mapa-security.headers.framedeny=true"
  # Previne clickjacking

- "traefik.http.middlewares.mapa-security.headers.contenttypenosniff=true"
  # Previne MIME type sniffing

- "traefik.http.middlewares.mapa-security.headers.browserxssfilter=true"
  # Ativa filtro XSS do navegador

- "traefik.http.middlewares.mapa-security.headers.referrerpolicy=same-origin"
  # Controla informações de referrer

- "traefik.http.middlewares.mapa-security.headers.stsseconds=31536000"
  # HSTS por 1 ano
```

### 3.2 Middleware de Rate Limiting (opcional)

```yaml
# Adicionar às labels:
- "traefik.http.middlewares.mapa-ratelimit.ratelimit.average=100"
- "traefik.http.middlewares.mapa-ratelimit.ratelimit.burst=50"
- "traefik.http.routers.mapa-https.middlewares=mapa-security,mapa-ratelimit"
```

## 📊 Passo 4: Monitoramento

### 4.1 Dashboard do Traefik

Acesse: `https://traefik.seudominio.com:8080`

### 4.2 Logs do Traefik

```bash
# Ver logs
docker logs traefik -f

# Ver logs do mapa político
docker logs mapa-politico -f
```

### 4.3 Status dos certificados

```bash
# Verificar certificados
docker exec traefik cat /letsencrypt/acme.json | jq '.letsencrypt.Certificates[].domain'
```

## 🔧 Troubleshooting

### Problema: Certificado não é gerado

**Solução:**
1. Verifique se o domínio aponta para o servidor
2. Verifique se as portas 80 e 443 estão abertas
3. Use o servidor de staging primeiro para testes

```yaml
# Para testes, adicione no traefik.yml:
certificatesResolvers:
  letsencrypt:
    acme:
      caServer: https://acme-staging-v02.api.letsencrypt.org/directory
```

### Problema: 404 Not Found

**Solução:**
1. Verifique se o container está na rede `traefik-network`
2. Verifique se as labels estão corretas
3. Verifique se o domínio está correto

```bash
# Verificar redes
docker network ls
docker network inspect traefik-network
```

### Problema: 502 Bad Gateway

**Solução:**
1. Verifique se o serviço está rodando na porta correta
2. Verifique health check
3. Verifique logs do container

```bash
# Verificar porta do serviço
docker exec mapa-politico netstat -tlnp
```

## 📝 Exemplo Completo de Configuração

### Estrutura de arquivos:

```
projeto/
├── traefik.yml                    # Configuração do Traefik
├── docker-compose.traefik-server.yml  # Traefik server
├── docker-compose.traefik.yml    # Mapa político com Traefik
├── letsencrypt/                   # Certificados SSL
└── .env                          # Variáveis de ambiente
```

### Arquivo `.env`:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=MinhaSenh@Segura123!
DOMAIN=mapa.meudominio.com
EMAIL=admin@meudominio.com
```

### Comandos para deploy completo:

```bash
# 1. Criar rede
docker network create traefik-network

# 2. Iniciar Traefik
docker-compose -f docker-compose.traefik-server.yml up -d

# 3. Aguardar Traefik inicializar (30 segundos)
sleep 30

# 4. Deploy do mapa político
docker-compose -f docker-compose.traefik.yml up -d

# 5. Verificar status
docker ps
docker logs traefik
docker logs mapa-politico
```

## 🌐 Acesso Final

Após configuração completa:

- **Site:** `https://mapa.seudominio.com`
- **Admin:** `https://mapa.seudominio.com/admin`
- **Dashboard Traefik:** `https://traefik.seudominio.com:8080`

## 🔒 Segurança em Produção

1. **Remover dashboard público** do Traefik
2. **Usar senhas fortes** para admin
3. **Configurar firewall** adequadamente
4. **Monitorar logs** regularmente
5. **Backup regular** dos certificados e dados

---

**Traefik configurado com SSL automático e proxy reverso! 🎉**