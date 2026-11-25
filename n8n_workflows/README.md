# 🚀 Workflows n8n + MongoDB — Organizador de Abas

Esta pasta contém os fluxos de trabalho (workflows) do **n8n** e a infraestrutura necessária para integrar o frontend do **Organizador de Abas** com o banco de dados **MongoDB**, permitindo persistência real e escalável na nuvem ou em servidor local.

---

## 📂 Arquivos Disponíveis

| Arquivo | Descrição |
| :--- | :--- |
| **`workflow-master.json`** | ⭐ **Recomendado:** Workflow completo (Master) unificando todas as operações de Grupos e Páginas em um único fluxo. |
| **`workflow-groups.json`** | Workflow modular dedicado exclusivamente ao CRUD de Grupos (`/groups`). |
| **`workflow-pages.json`** | Workflow modular dedicado exclusivamente ao CRUD de Páginas (`/pages`), incluindo importação em lote e favoritos. |
| **`mongo-init.js`** | Script de inicialização do MongoDB com índices de performance e dados iniciais de demonstração (seed). |
| **`docker-compose.n8n-mongo.yml`** | Ambiente Docker pronto para rodar MongoDB 7, Mongo-Express (GUI), n8n e o Frontend integrados com 1 comando. |

---

## 🏗️ Arquitetura de Comunicação

```mermaid
flowchart LR
    A["Frontend Next.js<br/>(Porta 3003)"] -->|"BFF /api/*"| B["n8n Webhooks<br/>(Porta 5678)"]
    B -->|"Driver Oficial MongoDB"| C[("MongoDB 7<br/>organizador_abas")]
    D["Mongo Express<br/>(GUI Porta 8081)"] -.->|"Visualização"| C
```

1. O frontend chama as rotas do BFF (`/api/groups`, `/api/pages`).
2. O servidor Next.js repassa com segurança a chamada para o webhook correspondente no **n8n**.
3. O workflow no **n8n** executa a operação no **MongoDB** na collection `groups` ou `pages`.
4. Os dados retornam formatados em JSON compatível com a interface do usuário.

---

## ⚡ Inicialização Rápida com Docker Compose (Tudo Integrado)

Se desejar subir todo o ambiente de uma só vez (MongoDB + n8n + Mongo Express + Frontend):

```bash
# A partir da raiz do projeto:
docker compose -f n8n_workflows/docker-compose.n8n-mongo.yml up -d
```

### Serviços iniciados:
- **Frontend Organizador de Abas:** [http://localhost:3003](http://localhost:3003)
- **Painel do n8n:** [http://localhost:5678](http://localhost:5678)
- **Mongo Express (Web GUI):** [http://localhost:8081](http://localhost:8081) (Login: `admin` / `admin`)
- **MongoDB:** `localhost:27017`

---

## 📥 Como Importar os Workflows no n8n

### Opção 1: Importar o Workflow Master (Recomendado)
1. Abra o n8n no navegador (`http://localhost:5678` ou seu domínio).
2. No menu lateral, clique em **Workflows** ➔ **Add workflow** (ou **+**).
3. No canto superior direito do canvas, clique nos três pontinhos (`⋮`) e selecione **Import from File...** (ou copie e cole o conteúdo do arquivo **`workflow-master.json`** diretamente no canvas com `Ctrl+V`).
4. Clique em **Save**.

### Opção 2: Importar Modularmente
Repita o mesmo processo importando separadamente os arquivos:
- `workflow-groups.json`
- `workflow-pages.json`

---

## 🔑 Configuração das Credenciais do MongoDB no n8n

1. No n8n, vá em **Credentials** ➔ **New Credential**.
2. Pesquise por **MongoDB** e selecione-o.
3. Preencha as configurações de conexão:
   - **Connection Type:** `Connection String` (ou `Values`)
   - **Connection String:**
     - Se estiver usando o Docker Compose fornecido:
       ```
       mongodb://admin:adminpassword@mongodb:27017/organizador_abas?authSource=admin
       ```
     - Se o n8n estiver rodando no host e o Mongo no Docker:
       ```
       mongodb://admin:adminpassword@localhost:27017/organizador_abas?authSource=admin
       ```
     - Se estiver usando MongoDB Atlas:
       ```
       mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/organizador_abas
       ```
4. Nomeie a credencial como `MongoDB account` e salve.
5. *(Se você usar outro nome de credencial)*, abra qualquer nó do MongoDB no workflow e selecione a sua credencial salva.

---

## 🟢 Ativação dos Workflows no n8n

> [!IMPORTANT]
> Para que os webhooks de produção respondam às chamadas do frontend, você **DEVE ativar o workflow**:
> No canto superior direito da tela do workflow no n8n, mude a chave de **Inactive** para **Active**.

Os webhooks de produção do n8n utilizam a rota padrão `/webhook/` (e não `/webhook-test/`).

---

## ⚙️ Configuração do Frontend para Conectar ao n8n

No arquivo `.env.local` na raiz do frontend, ajuste:

```env
# Ativa o modo n8n (em vez de 'demo' / LocalStorage)
NEXT_PUBLIC_STORAGE_MODE=n8n

# URL base dos Webhooks no n8n
N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook

# Token opcional de autorização (se configurar Header Auth)
N8N_WEBHOOK_AUTH_TOKEN=
```

Reinicie o frontend:
```bash
pnpm dev
```

---

## 📡 Contrato de Rotas dos Webhooks

### 📁 Grupos (`groups`)

#### 1. Listar Grupos
- **Método:** `GET`
- **Rota:** `/webhook/groups`
- **Resposta:**
  ```json
  [
    {
      "id": "grp_devops",
      "name": "DevOps & Cloud",
      "emoji": "☁️",
      "color": "#5b7082",
      "createdAt": "2026-11-20T10:00:00.000Z"
    }
  ]
  ```

#### 2. Criar Grupo
- **Método:** `POST`
- **Rota:** `/webhook/groups`
- **Body:**
  ```json
  {
    "name": "Projetos Pessoais",
    "emoji": "🚀",
    "color": "#c86446"
  }
  ```
- **Resposta (201):**
  ```json
  {
    "id": "grp_xyz123",
    "name": "Projetos Pessoais",
    "emoji": "🚀",
    "color": "#c86446",
    "createdAt": "2026-11-23T19:30:00.000Z"
  }
  ```

#### 3. Atualizar Grupo
- **Método:** `PATCH`
- **Rota:** `/webhook/groups/:id`
- **Body:**
  ```json
  {
    "name": "Projetos 2026",
    "color": "#819875"
  }
  ```

#### 4. Excluir Grupo
- **Método:** `DELETE`
- **Rota:** `/webhook/groups/:id`
- **Comportamento automático:** O grupo é removido da collection `groups` e todas as páginas pertencentes a ele têm o seu campo `groupId` atualizado para `null`, sendo realocadas automaticamente para o **Inbox (Sem grupo)**.

---

### 📄 Páginas (`pages`)

#### 1. Listar Páginas
- **Método:** `GET`
- **Rota:** `/webhook/pages`
- **Resposta:** Lista de páginas ordenadas pelas mais recentes.

#### 2. Criar Páginas (Individual ou em Lote / Bulk)
- **Método:** `POST`
- **Rota:** `/webhook/pages`
- **Body (Aceita array):**
  ```json
  [
    {
      "url": "https://nextjs.org/docs",
      "title": "Next.js Documentation",
      "groupId": "grp_devops",
      "notes": "Guia de referências"
    }
  ]
  ```
- **Resposta (201):** Array de páginas criadas com ID único (`pg_...`), domínio extraído e favicon do Google.

#### 3. Atualizar Página (Favoritar, Mover de Grupo, Editar Notas)
- **Método:** `PATCH`
- **Rota:** `/webhook/pages/:id`
- **Body:**
  ```json
  {
    "isFavorite": true,
    "groupId": "grp_devops",
    "notes": "Lembrar de revisar este link na sexta"
  }
  ```

#### 4. Excluir Página
- **Método:** `DELETE`
- **Rota:** `/webhook/pages/:id`

---

## 🧪 Testes Manuais com cURL

Você pode validar os webhooks diretamente pelo terminal com os seguintes comandos:

```bash
# 1. Testar listagem de grupos
curl -X GET http://localhost:5678/webhook/groups

# 2. Testar criação de grupo
curl -X POST http://localhost:5678/webhook/groups \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Group", "emoji": "🧪", "color": "#c86446"}'

# 3. Testar criação de página
curl -X POST http://localhost:5678/webhook/pages \
  -H "Content-Type: application/json" \
  -d '[{"url": "https://github.com", "title": "GitHub", "groupId": null, "notes": "Teste"}]'

# 4. Testar listagem de páginas
curl -X GET http://localhost:5678/webhook/pages
```
