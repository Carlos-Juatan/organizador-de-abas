# Organizador de Abas (Frontend)

Aplicação web rápida e elegante construída para solucionar a sobrecarga de abas abertas no navegador. Permite categorizar links em grupos coloridos com emojis, adicionar anotações pessoais, favoritar, pesquisar instantaneamente e reabrir grupos inteiros com um clique.

## 🎨 Identidade Visual (Tema Black)
- **Cores:** Fundo preto profundo (`#08080a`), cartões carvão com bordas sutis translúcidas e acentos em **tons terrosos** (Terracotta `#c86446`, Areia `#d4a373`, Oliva `#6b8e23`, Sálvia `#819875`, etc.).
- **Tipografia:** 
  - Títulos e Logotipo: **Fraunces** (serifa editorial com caráter).
  - Textos de interface e metadados: **Manrope** (sem serifa moderna de alta legibilidade).

---

## 🚀 Funcionalidades Principais

- 📥 **Importação em Lote de URLs:** Cole listas de URLs em texto simples ou links Markdown (`[Título](https://...)`) copiados de extensões como *Copy All URLs*.
- ➕ **Adição Individual:** Adicione URLs individuais com sugestão automática de título e notas rápidas.
- 📁 **Gestão de Grupos:** Crie, edite nome, cor e emoji, ou exclua grupos com realocação automática para o Inbox.
- 📥 **Grupo "Sem grupo" (Inbox):** Destino seguro para novos links que ainda não foram categorizados.
- ⚡ **Abertura em Massa:** Botão "Abrir todas as abas" do grupo com tratamento amigável caso o bloqueador de pop-ups do navegador intervenha.
- 🔍 **Busca Instantânea:** Atalho de teclado `/` para filtrar em tempo real por título, domínio, URL ou anotação.
- ⭐ **Favoritos & Ordenação:** Marque abas prioritárias com 1 clique (atualização otimista de 0ms) e ordene por recentes, antigos, A-Z ou favoritos.
- 🖱️ **Arrastar e Soltar (Drag & Drop):** Arraste o cartão de uma página e solte diretamente sobre qualquer grupo na barra lateral para movê-lo.
- 🔄 **Camada de Dados Agnóstica (Modo Duplo):**
  - **Modo Demo (LocalStorage):** Funciona 100% no navegador offline com dados de teste realistas pré-carregados.
  - **Modo n8n + MongoDB:** Alternável via variável de ambiente, comunicando-se com webhooks do n8n através de um BFF no Next.js (protegendo tokens e contornando CORS).

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Estilização:** Tailwind CSS v4 + Tokens CSS semânticos
- **Estado de Servidor & Cache:** TanStack Query v5 (com mutações otimistas)
- **Ícones:** Lucide React
- **Scraping de Metadados:** Cheerio no servidor Next.js (`/api/metadata`)
- **Containerização:** Docker (Multi-stage build com saída Standalone) + Docker Compose

---

## ⚙️ Configuração e Execução Local

### 1. Instalação de dependências
```bash
pnpm install
```

### 2. Variáveis de Ambiente
O arquivo `.env.local` já vem pré-configurado no modo demo:

```env
# "demo" (padrão, salva no navegador) ou "n8n" (conecta aos webhooks)
NEXT_PUBLIC_STORAGE_MODE=demo

# URL base dos webhooks no n8n (necessário apenas quando NEXT_PUBLIC_STORAGE_MODE=n8n)
N8N_WEBHOOK_BASE_URL=https://n8n.seu-dominio.com/webhook

# Token opcional de autorização
N8N_WEBHOOK_AUTH_TOKEN=
```

### 3. Executar em Desenvolvimento (Porta 3003)
```bash
pnpm dev
```
Acesse em: [http://localhost:3003](http://localhost:3003)

### 4. Compilar e Iniciar em Produção Local (Porta 3003)
```bash
pnpm build
pnpm start
```
Acesse em: [http://localhost:3003](http://localhost:3003)

---

## 🐳 Deploy com Docker e Docker Compose

O projeto está totalmente configurado para containerização com build multi-stage leve via **Next.js Standalone**.

### 1. Iniciar com Docker Compose
```bash
docker compose up -d --build
```
A aplicação estará rodando em segundo plano na porta **3003**:  
👉 **[http://localhost:3003](http://localhost:3003)**

Para visualizar os logs:
```bash
docker compose logs -f
```

Para parar o container:
```bash
docker compose down
```

### 2. Build e Execução Manual com Dockerfile
```bash
# Build da imagem
docker build -t organizador-de-abas:latest .

# Execução do container na porta 3003
docker run -d -p 3003:3003 --name organizador-de-abas organizador-de-abas:latest
```

---

## 📡 Contrato com Webhooks do n8n

Quando configurado com `NEXT_PUBLIC_STORAGE_MODE=n8n`, o BFF do Next.js repassa as requisições para:

- `GET /webhook/groups` — Retorna lista de grupos
- `POST /webhook/groups` — Cria `{ name, emoji, color }`
- `PATCH /webhook/groups/:id` — Atualiza grupo
- `DELETE /webhook/groups/:id` — Exclui grupo
- `GET /webhook/pages` — Retorna lista de páginas
- `POST /webhook/pages` — Cria uma ou mais páginas `[{ url, title, groupId, notes }]`
- `PATCH /webhook/pages/:id` — Atualiza `{ title, notes, groupId, isFavorite }`
- `DELETE /webhook/pages/:id` — Exclui página
