#!/bin/bash

echo "🔍 DIAGNÓSTICO MAPA POLÍTICO - voto-consciente.sxconnect.com.br"
echo "================================================================="

echo ""
echo "1️⃣ VERIFICANDO SERVIÇOS DOCKER SWARM..."
echo "-----------------------------------------"
docker service ls | grep -E "(NAME|mapa-politico)" || echo "❌ Nenhum serviço mapa-politico encontrado"

echo ""
echo "2️⃣ VERIFICANDO TASKS DO SERVIÇO..."
echo "-----------------------------------"
docker service ps mapa-politico_mapa-politico 2>/dev/null || echo "❌ Serviço mapa-politico_mapa-politico não encontrado"

echo ""
echo "3️⃣ VERIFICANDO CONTAINERS RODANDO..."
echo "-------------------------------------"
CONTAINERS=$(docker ps | grep mapa-politico)
if [ -z "$CONTAINERS" ]; then
    echo "❌ Nenhum container mapa-politico rodando"
else
    echo "✅ Containers encontrados:"
    echo "$CONTAINERS"
fi

echo ""
echo "4️⃣ TESTANDO HEALTH CHECK..."
echo "----------------------------"
CONTAINER_ID=$(docker ps -q -f name=mapa-politico | head -1)
if [ ! -z "$CONTAINER_ID" ]; then
    echo "Container ID: $CONTAINER_ID"
    echo "Testando health endpoint..."
    docker exec $CONTAINER_ID curl -f http://localhost:3001/health 2>/dev/null && echo "✅ Health check OK" || echo "❌ Health check falhou"
    
    echo "Testando página principal..."
    docker exec $CONTAINER_ID curl -f http://localhost:3001/ 2>/dev/null && echo "✅ Página principal OK" || echo "❌ Página principal falhou"
    
    echo "Verificando porta 3001..."
    docker exec $CONTAINER_ID netstat -tlnp | grep 3001 && echo "✅ Porta 3001 aberta" || echo "❌ Porta 3001 não encontrada"
else
    echo "❌ Nenhum container encontrado para testar"
fi

echo ""
echo "5️⃣ VERIFICANDO TRAEFIK..."
echo "--------------------------"
TRAEFIK_CONTAINER=$(docker ps | grep traefik)
if [ -z "$TRAEFIK_CONTAINER" ]; then
    echo "❌ Traefik não está rodando"
else
    echo "✅ Traefik encontrado:"
    echo "$TRAEFIK_CONTAINER"
fi

echo ""
echo "6️⃣ VERIFICANDO REDES..."
echo "-----------------------"
docker network ls | grep -E "(NAME|traefik)" || echo "❌ Rede traefik-network não encontrada"

echo ""
echo "7️⃣ VERIFICANDO DNS..."
echo "---------------------"
nslookup voto-consciente.sxconnect.com.br 2>/dev/null && echo "✅ DNS resolve" || echo "❌ DNS não resolve"

echo ""
echo "8️⃣ TESTANDO CONECTIVIDADE HTTP..."
echo "----------------------------------"
curl -I -m 10 http://voto-consciente.sxconnect.com.br 2>/dev/null && echo "✅ HTTP acessível" || echo "❌ HTTP não acessível"

echo ""
echo "9️⃣ TESTANDO CONECTIVIDADE HTTPS..."
echo "-----------------------------------"
curl -I -m 10 https://voto-consciente.sxconnect.com.br 2>/dev/null && echo "✅ HTTPS acessível" || echo "❌ HTTPS não acessível"

echo ""
echo "🔟 ÚLTIMOS LOGS DO SERVIÇO..."
echo "-----------------------------"
if docker service ls | grep -q mapa-politico; then
    echo "Últimas 10 linhas dos logs:"
    docker service logs mapa-politico_mapa-politico --tail 10 2>/dev/null || echo "❌ Não foi possível obter logs"
else
    echo "❌ Serviço não encontrado para obter logs"
fi

echo ""
echo "📊 RESUMO DO DIAGNÓSTICO"
echo "========================"

# Verificações resumidas
SERVICE_EXISTS=$(docker service ls | grep -q mapa-politico && echo "✅" || echo "❌")
CONTAINER_RUNNING=$(docker ps | grep -q mapa-politico && echo "✅" || echo "❌")
TRAEFIK_RUNNING=$(docker ps | grep -q traefik && echo "✅" || echo "❌")
DNS_RESOLVES=$(nslookup voto-consciente.sxconnect.com.br >/dev/null 2>&1 && echo "✅" || echo "❌")
HTTP_WORKS=$(curl -I -m 5 http://voto-consciente.sxconnect.com.br >/dev/null 2>&1 && echo "✅" || echo "❌")
HTTPS_WORKS=$(curl -I -m 5 https://voto-consciente.sxconnect.com.br >/dev/null 2>&1 && echo "✅" || echo "❌")

echo "Serviço existe:      $SERVICE_EXISTS"
echo "Container rodando:   $CONTAINER_RUNNING"
echo "Traefik rodando:     $TRAEFIK_RUNNING"
echo "DNS resolve:         $DNS_RESOLVES"
echo "HTTP funciona:       $HTTP_WORKS"
echo "HTTPS funciona:      $HTTPS_WORKS"

echo ""
echo "🚀 PRÓXIMOS PASSOS SUGERIDOS:"
echo "=============================="

if [ "$SERVICE_EXISTS" = "❌" ]; then
    echo "1. Fazer deploy da stack: docker stack deploy -c docker-swarm-stack.yml mapa-politico"
elif [ "$CONTAINER_RUNNING" = "❌" ]; then
    echo "1. Verificar logs de erro: docker service logs mapa-politico_mapa-politico"
    echo "2. Reiniciar serviço: docker service update --force mapa-politico_mapa-politico"
elif [ "$TRAEFIK_RUNNING" = "❌" ]; then
    echo "1. Iniciar Traefik ou usar deploy sem proxy reverso"
elif [ "$DNS_RESOLVES" = "❌" ]; then
    echo "1. Configurar DNS para apontar para este servidor"
elif [ "$HTTPS_WORKS" = "❌" ]; then
    echo "1. Verificar configuração SSL/TLS do Traefik"
    echo "2. Verificar logs do Traefik: docker logs traefik"
else
    echo "1. Sistema parece estar funcionando. Verificar cache do navegador (Ctrl+F5)"
fi

echo ""
echo "📞 Para suporte adicional, compartilhe este diagnóstico!"