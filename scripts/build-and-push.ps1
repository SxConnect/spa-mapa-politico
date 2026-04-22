# Script de Build e Push com Versionamento Automático
# Uso: .\build-and-push.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Build e Push - Spa Mapa Político ===" -ForegroundColor Cyan

# Ler versão do package.json
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$currentVersion = $packageJson.version
$imageName = "ghcr.io/sxconnect/spa-mapa-politico"

Write-Host "Versão atual: $currentVersion" -ForegroundColor Yellow

# Incrementar versão automaticamente (patch)
$versionParts = $currentVersion -split '\.'
$major = [int]$versionParts[0]
$minor = [int]$versionParts[1]
$patch = [int]$versionParts[2]
$patch++
$newVersion = "$major.$minor.$patch"

Write-Host "Nova versão: $newVersion" -ForegroundColor Green

# Confirmar build
$confirm = Read-Host "Deseja fazer build e push da versão $newVersion? (s/n)"
if ($confirm -ne "s") {
    Write-Host "Operação cancelada." -ForegroundColor Red
    exit 0
}

# Atualizar package.json com nova versão
Write-Host "`n[0/4] Atualizando package.json..." -ForegroundColor Green
$packageJson.version = $newVersion
$packageJson | ConvertTo-Json -Depth 100 | Set-Content "package.json"
$version = $newVersion

# Build da imagem
Write-Host "`n[1/4] Fazendo build da imagem..." -ForegroundColor Green
docker build -t "${imageName}:${version}" -t "${imageName}:latest" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no build!" -ForegroundColor Red
    exit 1
}

# Push da versão específica
Write-Host "`n[2/4] Fazendo push da versão ${version}..." -ForegroundColor Green
docker push "${imageName}:${version}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no push da versão!" -ForegroundColor Red
    exit 1
}

# Push da tag latest
Write-Host "`n[3/4] Fazendo push da tag latest..." -ForegroundColor Green
docker push "${imageName}:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no push da tag latest!" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Build e Push Concluídos com Sucesso! ===" -ForegroundColor Green
Write-Host "Versão atualizada: $currentVersion → $version" -ForegroundColor Cyan
Write-Host "Imagens criadas:" -ForegroundColor Cyan
Write-Host "  - ${imageName}:${version}" -ForegroundColor White
Write-Host "  - ${imageName}:latest" -ForegroundColor White
Write-Host "`nPara usar no Portainer/Docker:" -ForegroundColor Yellow
Write-Host "  docker pull ${imageName}:${version}" -ForegroundColor White
Write-Host "`nO package.json foi atualizado automaticamente!" -ForegroundColor Green
