# 🚀 Deploy no Portainer - SPA Mapa Político

## 📋 Pré-requisitos

- Portainer instalado e funcionando
- Acesso ao Portainer via web interface
- Docker funcionando no servidor

## 🐳 Imagem Docker

A imagem está disponível no GitHub Container Registry:
```
ghcr.io/sxconnect/spa-mapa-politico:latest
```

## 📦 Deploy via Portainer Stack

### Passo 1: Acessar Portainer

1. Acesse seu Portainer: `https://seu-servidor:9443`
2. Faça login com suas credenciais
3. Selecione o ambiente Docker

### Passo 2: Criar Nova Stack

1. Vá em **Stacks** no menu lateral
2. Clique em **Add stack**
3. Digite um nome: `mapa-politico`

### Passo 3: Configurar Stack

Cole o conteúdo do arquivo `portainer-stack.yml` ou use este YAML:

```yaml
version: '3.8'

services:
  mapa-politico:
    image: ghcr.io/sxconnect/spa-mapa-politico:latest
    container_name: mapa-politico
    restart: unless-stopped
    ports:
      - "8083:3001"
    volumes:
      - mapa-data:/app/data
      - mapa-uploads:/app/public/uploads
    environment:
      - NODE_ENV=production
      - PORT=3001
      - VITE_ADMIN_USERNAME=${ADMIN_USERNAME}
      - VITE_ADMIN_PASSWORD=${ADMIN_PASSWORD}
    networks:
      - mapa-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  mapa-data:
    driver: local
  mapa-uploads:
    driver: local

networks:
  mapa-network:
    driver: bridge
```

### Passo 4: Configurar Variáveis de Ambiente

Na seção **Environment variables**, adicione:

| Nome | Valor |
|------|-------|
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `SuaSenhaSegura123!` |

### Passo 5: Deploy

1. Clique em **Deploy the stack**
2. Aguarde o download da imagem e inicialização
3. Verifique se o container está rodando

## 🌐 Acesso ao Sistema

Após o deploy bem-sucedido:

- **Site público:** `http://seu-servidor:8083`
- **Painel admin:** `http://seu-servidor:8083/admin`
- **Login:** `http://seu-servidor:8083/login`

## 🔧 Configurações Avançadas

### Proxy Reverso (Nginx/Traefik)

Para usar um domínio personalizado, configure um proxy reverso:

```nginx
server {
    listen 80;
    server_name mapa.seudominio.com;

    location / {
        proxy_pass http://localhost:8083;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL/HTTPS

Para HTTPS, adicione certificado SSL:

```nginx
server {
    listen 443 ssl;
    server_name mapa.seudominio.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:8083;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 💾 Backup dos Dados

Os dados ficam nos volumes Docker:
- `mapa-data`: Dados JSON dos candidatos
- `mapa-uploads`: Imagens enviadas

### Fazer Backup

```bash
# Backup dos dados
docker run --rm -v mapa-politico_mapa-data:/data -v $(pwd):/backup alpine tar czf /backup/mapa-data-backup.tar.gz -C /data .

# Backup das imagens
docker run --rm -v mapa-politico_mapa-uploads:/data -v $(pwd):/backup alpine tar czf /backup/mapa-uploads-backup.tar.gz -C /data .
```

### Restaurar Backup

```bash
# Restaurar dados
docker run --rm -v mapa-politico_mapa-data:/data -v $(pwd):/backup alpine tar xzf /backup/mapa-data-backup.tar.gz -C /data

# Restaurar imagens
docker run --rm -v mapa-politico_mapa-uploads:/data -v $(pwd):/backup alpine tar xzf /backup/mapa-uploads-backup.tar.gz -C /data
```

## 🔍 Troubleshooting

### Container não inicia

1. Verifique os logs no Portainer:
   - Vá em **Containers**
   - Clique no container `mapa-politico`
   - Vá na aba **Logs**

2. Comandos úteis:
```bash
# Ver logs
docker logs mapa-politico

# Reiniciar container
docker restart mapa-politico

# Verificar status
docker ps | grep mapa-politico
```

### Porta em uso

Se a porta 8083 estiver em uso, altere no YAML:
```yaml
ports:
  - "8084:3001"  # Use porta 8084 em vez de 8083
```

### Problemas de permissão

```bash
# Verificar volumes
docker volume ls | grep mapa

# Inspecionar volume
docker volume inspect mapa-politico_mapa-data
```

## 📊 Monitoramento

### Health Check

O container possui health check configurado:
- **Intervalo:** 30 segundos
- **Timeout:** 10 segundos
- **Tentativas:** 3
- **Endpoint:** `http://localhost:3001/health`

### Logs

Para monitorar logs em tempo real:
```bash
docker logs -f mapa-politico
```

## 🔄 Atualizações

Para atualizar para uma nova versão:

1. No Portainer, vá em **Stacks**
2. Clique na stack `mapa-politico`
3. Clique em **Editor**
4. Altere a tag da imagem se necessário
5. Clique em **Update the stack**
6. Marque **Re-pull image and redeploy**
7. Clique em **Update**

## 📝 Notas Importantes

- **Porta padrão:** 8083 (pode ser alterada)
- **Volumes persistentes:** Dados não são perdidos ao reiniciar
- **Credenciais:** Altere a senha padrão em produção
- **Backup:** Faça backup regular dos volumes
- **Monitoramento:** Use o health check para monitorar status

---

**Sistema pronto para produção! 🎉**