# 🔍 Troubleshooting - Erro 404 no Deploy

## 🚨 Problema Identificado

**URL:** `https://voto-consciente.sxconnect.com.br`  
**Erro:** `404 page not found`

## 📋 Checklist de Diagnóstico

### 1. ✅ Verificar se o Container está Rodando

```bash
# Verificar serviços do Swarm
docker service ls

# Verificar tasks do serviço
docker service ps mapa-politico_mapa-politico

# Verificar containers rodando
docker ps | grep mapa-politico
```

**Resultado esperado:** Container deve estar com status `Running`

### 2. ✅ Verificar Logs do Container

```bash
# Ver logs do serviço
docker service logs mapa-politico_mapa-politico -f

# Ver logs de um container específico
docker logs $(docker ps -q -f name=mapa-politico) -f
```

**Procurar por:**
- ✅ `🚀 Server running on http://0.0.0.0:3001`
- ❌ Erros de inicialização
- ❌ Problemas de porta

### 3. ✅ Testar Acesso Direto ao Container

```bash
# Testar health check
docker exec $(docker ps -q -f name=mapa-politico) curl -f http://localhost:3001/health

# Testar página principal
docker exec $(docker ps -q -f name=mapa-politico) curl -f http://localhost:3001/

# Verificar se a porta está aberta
docker exec $(docker ps -q -f name=mapa-politico) netstat -tlnp | grep 3001
```

### 4. ✅ Verificar Configuração do Traefik

```bash
# Verificar se Traefik está rodando
docker ps | grep traefik

# Ver logs do Traefik
docker logs traefik -f

# Verificar roteadores do Traefik
curl -s http://localhost:8080/api/http/routers | jq '.'
```

### 5. ✅ Verificar Rede Docker

```bash
# Verificar redes
docker network ls | grep traefik

# Inspecionar rede do Traefik
docker network inspect traefik-network

# Verificar se o container está na rede correta
docker inspect $(docker ps -q -f name=mapa-politico) | grep NetworkMode
```

## 🔧 Soluções Possíveis

### Solução 1: Container não está rodando

```bash
# Verificar por que o container parou
docker service ps mapa-politico_mapa-politico --no-trunc

# Reiniciar o serviço
docker service update --force mapa-politico_mapa-politico

# Ou fazer redeploy
docker stack deploy -c docker-swarm-stack.yml mapa-politico
```

### Solução 2: Problema de Rede

```bash
# Recriar rede do Traefik
docker network rm traefik-network
docker network create --driver overlay traefik-network

# Redeploy dos serviços
docker stack deploy -c traefik-stack.yml traefik
docker stack deploy -c docker-swarm-stack.yml mapa-politico
```

### Solução 3: Labels do Traefik Incorretas

Verifique se as labels estão corretas no arquivo de stack:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.docker.network=traefik-network"
  - "traefik.http.routers.voto-consciente-https.rule=Host(`voto-consciente.sxconnect.com.br`)"
  - "traefik.http.routers.voto-consciente-https.entrypoints=websecure"
  - "traefik.http.routers.voto-consciente-https.tls=true"
  - "traefik.http.routers.voto-consciente-https.tls.certresolver=letsencrypt"
  - "traefik.http.services.voto-consciente-service.loadbalancer.server.port=3001"
```

### Solução 4: Problema de DNS/Domínio

```bash
# Verificar se o domínio aponta para o servidor
nslookup voto-consciente.sxconnect.com.br

# Testar acesso direto por IP
curl -H "Host: voto-consciente.sxconnect.com.br" http://SEU_IP_SERVIDOR/

# Verificar certificado SSL
openssl s_client -connect voto-consciente.sxconnect.com.br:443 -servername voto-consciente.sxconnect.com.br
```

## 🚀 Deploy de Emergência (Sem Traefik)

Se o Traefik estiver causando problemas, use deploy direto:

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
    volumes:
      - mapa-politico-data:/app/data
      - mapa-politico-uploads:/app/public/uploads
    ports:
      - "3001:3001"  # Acesso direto
    networks:
      - mapa-network
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure

volumes:
  mapa-politico-data:
  mapa-politico-uploads:

networks:
  mapa-network:
    driver: overlay
```

**Deploy:**
```bash
docker stack deploy -c emergency-stack.yml mapa-politico
```

**Acesso:** `http://SEU_IP:3001`

## 🔍 Comandos de Diagnóstico Rápido

### Script de Diagnóstico Completo

```bash
#!/bin/bash
echo "=== DIAGNÓSTICO MAPA POLÍTICO ==="

echo "1. Verificando serviços..."
docker service ls | grep mapa-politico

echo "2. Verificando tasks..."
docker service ps mapa-politico_mapa-politico

echo "3. Verificando containers..."
docker ps | grep mapa-politico

echo "4. Testando health check..."
CONTAINER_ID=$(docker ps -q -f name=mapa-politico)
if [ ! -z "$CONTAINER_ID" ]; then
    docker exec $CONTAINER_ID curl -f http://localhost:3001/health
else
    echo "Container não encontrado!"
fi

echo "5. Verificando Traefik..."
docker ps | grep traefik

echo "6. Verificando redes..."
docker network ls | grep traefik

echo "7. Últimos logs..."
docker service logs mapa-politico_mapa-politico --tail 20
```

### Teste de Conectividade

```bash
# Salvar como test-connectivity.sh
#!/bin/bash

# Testar DNS
echo "Testando DNS..."
nslookup voto-consciente.sxconnect.com.br

# Testar HTTP
echo "Testando HTTP..."
curl -I http://voto-consciente.sxconnect.com.br

# Testar HTTPS
echo "Testando HTTPS..."
curl -I https://voto-consciente.sxconnect.com.br

# Testar porta direta (se exposta)
echo "Testando porta 3001..."
curl -I http://voto-consciente.sxconnect.com.br:3001
```

## 📊 Cenários Comuns e Soluções

### Cenário 1: "Container não inicia"
**Sintomas:** Serviço existe mas não há containers rodando  
**Solução:** Verificar logs de erro e corrigir configuração

### Cenário 2: "Container roda mas 404"
**Sintomas:** Container healthy mas Traefik retorna 404  
**Solução:** Verificar labels e rede do Traefik

### Cenário 3: "SSL/TLS error"
**Sintomas:** Erro de certificado ou conexão  
**Solução:** Verificar Let's Encrypt e configuração TLS

### Cenário 4: "DNS não resolve"
**Sintomas:** Domínio não aponta para servidor  
**Solução:** Configurar DNS corretamente

## 🆘 Suporte de Emergência

Se nada funcionar, use este deploy mínimo:

```bash
# Deploy direto sem Swarm
docker run -d \
  --name mapa-politico-emergency \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=0r5wHmpBmInk \
  ghcr.io/sxconnect/spa-mapa-politico:latest

# Testar
curl http://localhost:3001
```

## 📝 Próximos Passos

1. **Execute o diagnóstico** usando os comandos acima
2. **Identifique o problema** específico
3. **Aplique a solução** correspondente
4. **Teste o acesso** novamente
5. **Documente a solução** para futuras referências

---

**Execute estes comandos e me informe os resultados para ajuda específica! 🔍**