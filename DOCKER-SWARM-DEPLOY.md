# 🐳 Deploy Docker Swarm - SPA Mapa Político

## 📋 Pré-requisitos

- Docker Swarm inicializado
- Acesso ao manager node
- Imagem disponível no registry

## 🚀 Opções de Deploy

### Opção 1: Com Traefik (Recomendado)

Use `docker-swarm-stack.yml` se você tem Traefik configurado no Swarm.

#### Características:
- ✅ SSL automático via Let's Encrypt
- ✅ Proxy reverso
- ✅ Headers de segurança
- ✅ Redirecionamento HTTP → HTTPS

#### Deploy:
```bash
docker stack deploy -c docker-swarm-stack.yml mapa-politico
```

### Opção 2: Sem Traefik (Simples)

Use `docker-swarm-simple.yml` para deploy direto com portas expostas.

#### Características:
- ✅ Deploy simples
- ✅ Porta 3001 exposta
- ✅ Configuração básica
- ❌ Sem SSL automático

#### Deploy:
```bash
docker stack deploy -c docker-swarm-simple.yml mapa-politico
```

## 🔧 Configuração da Stack

### Sua Stack Original (Corrigida):

```yaml
version: '3.8'

services:
  mapa-politico:
    image: ghcr.io/sxconnect/spa-mapa-politico:latest  # ✅ Imagem corrigida
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
    networks:                                          # ✅ Rede adicionada
      - mapa-network
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      placement:
        constraints:
          - node.role == manager
    healthcheck:                                       # ✅ Health check adicionado
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  mapa-politico-data:
  mapa-politico-uploads:

networks:                                              # ✅ Rede definida
  mapa-network:
    driver: overlay
    attachable: true
```

## 📦 Comandos de Deploy

### Deploy da Stack

```bash
# Deploy
docker stack deploy -c docker-swarm-simple.yml mapa-politico

# Verificar status
docker stack ls
docker stack ps mapa-politico

# Ver logs
docker service logs mapa-politico_mapa-politico -f
```

### Gerenciamento da Stack

```bash
# Atualizar stack
docker stack deploy -c docker-swarm-simple.yml mapa-politico

# Escalar serviço
docker service scale mapa-politico_mapa-politico=2

# Remover stack
docker stack rm mapa-politico
```

## 🔍 Monitoramento

### Verificar Status dos Serviços

```bash
# Listar serviços
docker service ls

# Detalhes do serviço
docker service inspect mapa-politico_mapa-politico

# Logs em tempo real
docker service logs -f mapa-politico_mapa-politico

# Verificar tasks
docker service ps mapa-politico_mapa-politico
```

### Health Check

O health check está configurado para:
- **Endpoint:** `http://localhost:3001/health`
- **Intervalo:** 30 segundos
- **Timeout:** 10 segundos
- **Tentativas:** 3
- **Start period:** 40 segundos

## 🔄 Atualizações

### Rolling Update

```bash
# Atualizar para nova versão
docker service update --image ghcr.io/sxconnect/spa-mapa-politico:v1.1.0 mapa-politico_mapa-politico

# Rollback se necessário
docker service rollback mapa-politico_mapa-politico
```

### Configuração de Update

```yaml
deploy:
  update_config:
    parallelism: 1        # Atualizar 1 container por vez
    delay: 10s           # Aguardar 10s entre atualizações
    failure_action: rollback  # Rollback em caso de falha
    order: start-first   # Iniciar novo antes de parar antigo
  rollback_config:
    parallelism: 1
    delay: 5s
    failure_action: pause
    order: stop-first
```

## 💾 Backup dos Dados

### Backup dos Volumes

```bash
# Listar volumes
docker volume ls | grep mapa-politico

# Backup dos dados
docker run --rm -v mapa-politico_mapa-politico-data:/data -v $(pwd):/backup alpine tar czf /backup/mapa-data-backup.tar.gz -C /data .

# Backup das imagens
docker run --rm -v mapa-politico_mapa-politico-uploads:/data -v $(pwd):/backup alpine tar czf /backup/mapa-uploads-backup.tar.gz -C /data .
```

### Restaurar Backup

```bash
# Restaurar dados
docker run --rm -v mapa-politico_mapa-politico-data:/data -v $(pwd):/backup alpine tar xzf /backup/mapa-data-backup.tar.gz -C /data

# Restaurar imagens
docker run --rm -v mapa-politico_mapa-politico-uploads:/data -v $(pwd):/backup alpine tar xzf /backup/mapa-uploads-backup.tar.gz -C /data
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Serviço não inicia

```bash
# Verificar logs
docker service logs mapa-politico_mapa-politico

# Verificar eventos
docker system events --filter service=mapa-politico_mapa-politico

# Verificar constraints
docker node ls
```

#### 2. Health check falhando

```bash
# Testar health check manualmente
docker exec $(docker ps -q -f name=mapa-politico) node -e "require('http').get('http://localhost:3001/health', (r) => {console.log(r.statusCode)})"

# Verificar se o serviço está rodando na porta correta
docker exec $(docker ps -q -f name=mapa-politico) netstat -tlnp
```

#### 3. Problemas de rede

```bash
# Verificar redes
docker network ls
docker network inspect mapa-politico_mapa-network

# Testar conectividade
docker run --rm --network mapa-politico_mapa-network alpine ping mapa-politico_mapa-politico
```

## 🌐 Acesso ao Sistema

### URLs de Acesso

- **Site público:** `https://voto-consciente.sxconnect.com.br`
- **Painel admin:** `https://voto-consciente.sxconnect.com.br/admin`
- **Login:** `https://voto-consciente.sxconnect.com.br/login`

### Credenciais

- **Usuário:** `admin`
- **Senha:** `0r5wHmpBmInk`

## 📊 Configurações Avançadas

### Múltiplas Réplicas

```yaml
deploy:
  replicas: 3  # 3 instâncias para alta disponibilidade
  placement:
    max_replicas_per_node: 1  # Máximo 1 réplica por node
```

### Recursos Limitados

```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

### Labels Personalizadas

```yaml
deploy:
  labels:
    - "app=mapa-politico"
    - "version=1.0.0"
    - "environment=production"
```

## ✅ Checklist de Deploy

- [ ] Docker Swarm inicializado
- [ ] Imagem disponível no registry
- [ ] Arquivo de stack configurado
- [ ] Variáveis de ambiente definidas
- [ ] Rede criada (se necessário)
- [ ] Deploy executado
- [ ] Serviços verificados
- [ ] Health check funcionando
- [ ] Acesso testado
- [ ] Backup configurado

---

**Deploy Docker Swarm configurado com sucesso! 🎉**