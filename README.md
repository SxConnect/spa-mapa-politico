# SPA Mapa Político do Brasil

Sistema Single Page Application para divulgação de candidatos políticos com mapa interativo do Brasil.

## 🚀 Características

- ✅ Mapa SVG interativo do Brasil (27 estados)
- ✅ Cards de candidatos com informações completas
- ✅ Filtros por estado e cargo
- ✅ Busca global de candidatos
- ✅ Painel administrativo completo
- ✅ Tema claro/escuro
- ✅ Totalmente responsivo
- ✅ Sem banco de dados (localStorage + JSON)
- ✅ Autenticação simples (usuário/senha)

## 📋 Cargos Suportados

1. **Presidente** - Aparece em todos os estados
2. **Senador** - Por estado
3. **Deputado Federal** - Por estado
4. **Deputado Estadual** - Por estado
5. **Governador** - Por estado
6. **Prefeito** - Por município

## 🛠️ Tecnologias

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express
- **Estado:** Zustand
- **Formulários:** React Hook Form
- **Ícones:** Lucide React
- **Build:** Vite
- **Containerização:** Docker

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/SxConnect/spa-mapa-politico.git
cd spa-mapa-politico
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=sua_senha_segura
```

4. **Inicie o desenvolvimento**
```bash
# Frontend + Backend
npm run dev:full

# Ou separadamente:
npm run dev      # Frontend (porta 5173)
npm run server   # Backend (porta 3001)
```

## 🌐 Acesso

- **Site público:** http://localhost:5173
- **Painel admin:** http://localhost:5173/admin
- **Login:** http://localhost:5173/login

## 🔧 Build para Produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`.

## 🐳 Docker

### Build local
```bash
docker build -t mapa-politico .
```

### Docker Compose
```bash
# Configurar variáveis no .env.docker
cp .env.example .env.docker

# Iniciar
docker-compose up -d

# Parar
docker-compose down
```

O sistema estará disponível em: http://localhost:8083

## 📊 Estrutura de Dados

### Candidatos
Cada candidato possui:
- **Informações básicas:** Nome, nome completo, partido, número
- **Localização:** Estado, município (para prefeitos)
- **Mídia:** Foto, descrição/biografia
- **Contatos:** Redes sociais, site, WhatsApp
- **Status:** Ativo/inativo

### Configurações
- Nome do projeto e textos
- Logo e imagem de cabeçalho
- Cores personalizadas
- Tema (claro/escuro)

## 🔐 Administração

### Acesso ao Admin
1. Acesse `/login`
2. Use as credenciais configuradas no `.env`
3. Gerencie candidatos e configurações

### Funcionalidades do Admin

#### Candidatos
- ➕ Adicionar/editar/excluir candidatos
- 📸 Upload de fotos (compressão automática)
- 📱 Redes sociais (Instagram, Facebook, X, YouTube, TikTok, LinkedIn)
- 🌐 Site/página de campanha
- 📝 Descrição/biografia (máx. 500 caracteres)
- ✅ Status ativo/inativo

#### Configurações
- 🏷️ Nome do projeto
- 🖼️ Logo e banner
- 🎨 Cores (primária, secundária, mapa)
- 🌙 Tema (claro/escuro)
- 📄 Textos (sobre, rodapé)

#### Backup e Restauração
- 💾 Download dos dados em JSON
- 📤 Upload de backup anterior
- 🔄 Restauração completa do sistema

## 📁 Estrutura de Arquivos

```
spa-mapa-politico/
├── src/
│   ├── components/
│   │   ├── admin/           # Componentes do painel admin
│   │   ├── public/          # Componentes públicos
│   │   └── storefront/      # Componentes do site público
│   ├── pages/               # Páginas principais
│   ├── store/               # Gerenciamento de estado (Zustand)
│   ├── types.ts             # Tipos TypeScript
│   └── utils/               # Utilitários
├── server/                  # Backend Node.js
├── data/                    # Dados persistidos
├── public/uploads/          # Imagens enviadas
├── docs/                    # Documentação
└── dist/                    # Build de produção
```

## 💾 Backup e Dados

### Localização dos Dados
- **Arquivo principal:** `data/store-data.json`
- **Imagens:** `public/uploads/`
- **Backup local:** localStorage do navegador

### Como fazer Backup
1. Pelo painel admin: Seção "Backup e Restauração"
2. Manual: Copiar `data/store-data.json` + `public/uploads/`

### Como Restaurar
1. Pelo painel admin: Upload do arquivo JSON
2. Manual: Substituir arquivos e reiniciar

## 🔒 Segurança

- Senhas são hasheadas com bcrypt
- Autenticação por token
- Upload de imagens com validação
- Sanitização de dados de entrada

## 📝 Observações Importantes

- **Candidatos a Presidente:** Aparecem automaticamente em todos os estados
- **Candidatos a Prefeito:** Precisam ter município informado
- **Fotos:** Convertidas para base64 e comprimidas automaticamente
- **Limite de descrição:** 500 caracteres por candidato
- **Dados:** Salvos em JSON local (sem banco de dados)

## 🆘 Troubleshooting

### Problemas Comuns

1. **Erro de permissão nas pastas**
```bash
mkdir -p data public/uploads
chmod 755 data public/uploads
```

2. **Porta em uso**
```bash
# Verificar processos na porta
netstat -ano | findstr :3001
# Matar processo se necessário
```

3. **Dependências desatualizadas**
```bash
npm update
```

### Logs
```bash
# Ver logs do container
docker logs mapa-politico

# Ver logs do servidor
npm run server
```

## 📄 Licença

MIT License - Veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

**Desenvolvido para facilitar a divulgação de candidatos políticos de forma transparente e acessível.**
