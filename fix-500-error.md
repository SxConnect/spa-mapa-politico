# 🚨 Correção do Erro 500 no Portainer

## 🔍 Problema Identificado

**Erro:** `Request failed with status code 500`  
**Causa:** Configuração inválida na stack (provavelmente rede externa inexistente)

## 🚀 Solução Imediata

### Opção 1: Stack Simplificada (Recomendada)

Use esta configuração sem Traefik para funcionar imediatamente:

```yaml
version: '3.8'

services:
  mapa-politico:
    image: ghcr.io/sxconnect/spa-mapa-politico:latest
    environment:
      - NODE_ENV=production
      - PORT=3001
      - HOST=0.0.0.0
      - ADMIN_USERNAME=admin
      - ADMIN_PASSWORD=0r5wHmpBmInk
      - PUBLIC_URL=https://voto-consciente.sxconnect.com.br
      - DOMAIN=voto-consciente.sxconnect.com.br
    volumes:
      - mapa-politico-data:/app/data
      - mapa-politico-uploads:/app/public/uploads
    ports:
      - "3001:3001"
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      placement:
        constraints:
          - node.role == manager
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  mapa-politico-data:
  mapa-politico-uploads:
```

**Acesso:** `http://SEU_IP_SERVIDOR:3001`

### Opção 2: Identificar Rede Correta do Traefik

Se quiser usar Traefik, primeiro identifique a rede correta:

#### Passo 1: Verificar Redes Disponíveis

No servidor, execute:
```bash
docker network ls
```

Procure por redes como:
- `traefik_default`
- `traefik_traefik`
- `proxy`
- Qualquer rede que contenha "traefik"

#### Passo 2: Verificar Qual Rede o Traefik Usa

```bash
# Encontrar container do Traefik
docker ps | grep traefik

# Verificar redes do container Traefik
docker inspect TRAEFIK_CONTAINER_ID | grep NetworkMode
```

#### Passo 3: Stack com Traefik (Após Identificar Rede)

```yaml
version: '3.8'

services:
  mapa-politico:
    image: ghcr.io/sxconnect/spa-mapa-politico:latest
    environment:
      - NODE_ENV=production
      - PORT=3001
      - HOST=0.0.0.0
      - ADMIN_USERNAME=admin
      - ADMIN_PASSWORD=0r5wHmpBmInk
      - PUBLIC_URL=https://voto-consciente.sxconnect.com.br
      - DOMAIN=voto-consciente.sxconnect.com.br
    volumes:
      - mapa-politico-data:/app/data
      - mapa-politico-uploads:/app/public/uploads
    networks:
      - NOME_DA_REDE_TRAEFIK  # Substituir pelo nome real
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.docker.network=NOME_DA_REDE_TRAEFIK"  # Substituir
        - "traefik.http.routers.voto-http.rule=Host(`voto-consciente.sxconnect.com.br`)"
        - "traefik.http.routers.voto-http.entrypoints=web"
        - "traefik.http.routers.voto-https.rule=Host(`voto-consciente.sxconnect.com.br`)"
        - "traefik.http.routers.voto-https.entrypoints=websecure"
        - "traefik.http.routers.voto-https.tls=true"
        - "traefik.http.services.voto-service.loadbalancer.server.port=3001"

volumes:
  mapa-politico-data:
  mapa-politico-uploads:

networks:
  NOME_DA_REDE_TRAEFIK:  # Substituir pelo nome real
    external: true
```

## 🔧 Passos para Correção

### Método 1: Acesso Direto (Mais Rápido)

1. **No Portainer:**
   - Vá em **Stacks**
   - Clique na stack `voto`
   - Clique em **Editor**

2. **Cole a stack simplificada** (Opção 1 acima)

3. **Clique em "Update the stack"**

4. **Acesse:** `http://SEU_IP_SERVIDOR:3001`

### Método 2: Com Traefik (Mais Complexo)

1. **Identifique a rede do Traefik** usando os comandos acima

2. **Substitua `NOME_DA_REDE_TRAEFIK`** na stack da Opção 2

3. **Atualize a stack** no Portainer

## 🆘 Troubleshooting do Erro 500

### Possíveis Causas:

1. **Rede externa não existe**
   ```bash
   # Verificar se a rede existe
   docker network ls | grep traefik
   ```

2. **Sintaxe YAML incorreta**
   - Verificar indentação
   - Verificar caracteres especiais

3. **Labels duplicadas**
   - Remover labels conflitantes

4. **Constraints inválidas**
   - Verificar se o node é manager

### Comandos de Diagnóstico:

```bash
# 1. Verificar logs do Portainer
docker logs portainer

# 2. Verificar se o Swarm está ativo
docker node ls

# 3. Verificar redes disponíveis
docker network ls

# 4. Testar deploy via CLI
docker stack deploy -c stack.yml teste
```

## 📊 Configuração Mínima Garantida

Se tudo falhar, use esta configuração ultra-simples:

```yaml
version: '3.8'

services:
  mapa-politico:
    image: ghcr.io/sxconnect/spa-mapa-politico:latest
    environment:
      NODE_ENV: production
      PORT: 3001
      ADMIN_USERNAME: admin
      ADMIN_PASSWORD: 0r5wHmpBmInk
    volumes:
      - mapa-politico-data:/app/data
      - mapa-politico-uploads:/app/public/uploads
    ports:
      - "3001:3001"
    deploy:
      replicas: 1

volumes:
  mapa-politico-data:
  mapa-politico-uploads:
```

## 🎯 Recomendação

**Use a Opção 1 (stack simplificada) primeiro para ter o sistema funcionando rapidamente.**

Depois que estiver funcionando, você pode configurar o Traefik separadamente se necessário.

**Acesso será:** `http://SEU_IP_SERVIDOR:3001`

---

**Execute a Opção 1 e me informe se funcionou! 🚀**