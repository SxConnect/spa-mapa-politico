# 🔧 Correção do Roteamento Traefik - Erro 404

## 🎯 Problema Identificado

- ✅ Container está rodando (healthy)
- ✅ Servidor funcionando na porta 3001
- ❌ Traefik não está roteando para o container
- ❌ Erro 404 no domínio `voto-consciente.sxconnect.com.br`

## 🔍 Diagnóstico Específico

### 1. Verificar Labels do Container

Execute no Portainer ou via SSH:

```bash
# Verificar labels do container
docker inspect voto_mapa-politico.1.v47sata... | grep -A 20 Labels

# Ou verificar via Portainer: Container → Inspect → Labels
```

### 2. Verificar Rede do Traefik

```bash
# Verificar se o container está na rede do Traefik
docker network inspect traefik_default | grep voto_mapa-politico

# Listar redes disponíveis
docker network ls | grep traefik
```

## 🚀 Soluções

### Solução 1: Corrigir Labels na Stack

Sua stack precisa ter estas labels específicas:

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
      - traefik_default  # ⚠️ IMPORTANTE: Use a rede do seu Traefik
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
        # Habilitar Traefik
        - "traefik.enable=true"
        - "traefik.docker.network=traefik_default"  # ⚠️ Ajustar para sua rede
        
        # Roteador HTTP (redireciona para HTTPS)
        - "traefik.http.routers.voto-http.rule=Host(`voto-consciente.sxconnect.com.br`)"
        - "traefik.http.routers.voto-http.entrypoints=web"
        - "traefik.http.routers.voto-http.middlewares=redirect-to-https"
        
        # Roteador HTTPS
        - "traefik.http.routers.voto-https.rule=Host(`voto-consciente.sxconnect.com.br`)"
        - "traefik.http.routers.voto-https.entrypoints=websecure"
        - "traefik.http.routers.voto-https.tls=true"
        - "traefik.http.routers.voto-https.tls.certresolver=letsencrypt"
        
        # Serviço (porta do container)
        - "traefik.http.services.voto-service.loadbalancer.server.port=3001"
        
        # Middleware de redirecionamento
        - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"
        - "traefik.http.middlewares.redirect-to-https.redirectscheme.permanent=true"

volumes:
  mapa-politico-data:
  mapa-politico-uploads:

networks:
  traefik_default:
    external: true  # ⚠️ Usar rede externa do Traefik
```

### Solução 2: Identificar a Rede Correta do Traefik

```bash
# 1. Verificar qual rede o Traefik está usando
docker inspect traefik_traefik.1.trjkSuy5j8d... | grep NetworkMode

# 2. Listar todas as redes
docker network ls

# 3. Verificar containers na rede do Traefik
docker network inspect NOME_DA_REDE_TRAEFIK
```

### Solução 3: Stack Corrigida para Portainer

Cole esta stack no Portainer (ajuste a rede conforme necessário):

```yaml
version: '3.8'

services:
  mapa-politico:
    image: ghcr.io/sxconnect/spa-mapa-politico:latest
    environment:
      NODE_ENV: production
      PORT: 3001
      HOST: 0.0.0.0
      ADMIN_USERNAME: admin
      ADMIN_PASSWORD: 0r5wHmpBmInk
      PUBLIC_URL: https://voto-consciente.sxconnect.com.br
      DOMAIN: voto-consciente.sxconnect.com.br
    volumes:
      - mapa-politico-data:/app/data
      - mapa-politico-uploads:/app/public/uploads
    networks:
      - traefik_default
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
        - traefik.enable=true
        - traefik.docker.network=traefik_default
        - traefik.http.routers.voto-http.rule=Host(`voto-consciente.sxconnect.com.br`)
        - traefik.http.routers.voto-http.entrypoints=web
        - traefik.http.routers.voto-http.middlewares=redirect-to-https
        - traefik.http.routers.voto-https.rule=Host(`voto-consciente.sxconnect.com.br`)
        - traefik.http.routers.voto-https.entrypoints=websecure
        - traefik.http.routers.voto-https.tls=true
        - traefik.http.routers.voto-https.tls.certresolver=letsencrypt
        - traefik.http.services.voto-service.loadbalancer.server.port=3001
        - traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https
        - traefik.http.middlewares.redirect-to-https.redirectscheme.permanent=true

volumes:
  mapa-politico-data:
  mapa-politico-uploads:

networks:
  traefik_default:
    external: true
```

## 🔧 Passos para Correção

### Passo 1: Identificar a Rede do Traefik

No Portainer:
1. Vá em **Networks**
2. Procure por redes com "traefik" no nome
3. Anote o nome exato (ex: `traefik_default`, `traefik_traefik`, etc.)

### Passo 2: Atualizar a Stack

1. No Portainer, vá em **Stacks**
2. Clique na stack `voto`
3. Clique em **Editor**
4. Substitua o conteúdo pela stack corrigida acima
5. **IMPORTANTE:** Altere `traefik_default` para o nome correto da rede
6. Clique em **Update the stack**

### Passo 3: Verificar Roteamento

Após atualizar, verifique:

```bash
# Ver se o container está na rede correta
docker network inspect NOME_DA_REDE_TRAEFIK | grep voto

# Verificar dashboard do Traefik (se disponível)
# http://SEU_IP:8080 ou https://traefik.seudominio.com
```

## 🆘 Solução Alternativa (Sem Traefik)

Se o Traefik continuar com problemas, use acesso direto:

```yaml
version: '3.8'

services:
  mapa-politico:
    image: ghcr.io/sxconnect/spa-mapa-politico:latest
    environment:
      NODE_ENV: production
      PORT: 3001
      HOST: 0.0.0.0
      ADMIN_USERNAME: admin
      ADMIN_PASSWORD: 0r5wHmpBmInk
    volumes:
      - mapa-politico-data:/app/data
      - mapa-politico-uploads:/app/public/uploads
    ports:
      - "3001:3001"  # Expor porta diretamente
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure

volumes:
  mapa-politico-data:
  mapa-politico-uploads:
```

**Acesso:** `http://SEU_IP_SERVIDOR:3001`

## 📊 Comandos de Verificação

```bash
# 1. Verificar rede do Traefik
docker network ls | grep traefik

# 2. Verificar se container está na rede
docker network inspect REDE_TRAEFIK | grep -A 10 -B 10 voto

# 3. Testar acesso direto ao container
docker exec CONTAINER_ID curl http://localhost:3001

# 4. Verificar logs do Traefik
docker logs TRAEFIK_CONTAINER_ID | grep voto
```

## 🎯 Próximos Passos

1. **Identifique a rede correta do Traefik**
2. **Atualize a stack com a rede correta**
3. **Verifique se o container aparece na rede**
4. **Teste o acesso novamente**

**Qual é o nome da rede que aparece quando você executa `docker network ls | grep traefik`?** 🤔