# Deploy do MoneyMapp no Render ou Vercel

Este guia descreve como hospedar **o banco de dados MySQL** e o **backend Node/Express** do MoneyMapp tanto no [Render](https://render.com/) (recomendado para serviços persistentes) quanto na [Vercel](https://vercel.com/) (serverless).

---

## Opção A: Deploy no Render (recomendado para backend tradicional)

### Visão geral da infraestrutura

- **Database**: instância gerenciada de **MySQL 8** no Render (outra opção é apontar para um MySQL externo compatível).
- **Backend API**: serviço "Web Service" Node.js apontando para a pasta `backend/` deste repositório.
- **Rede**: mantenha banco e API na mesma região (ex.: `oregon`) para reduzir latência.
- **Observabilidade**: utilize o endpoint `/health` para health-checks e configure alertas no painel do Render se necessário.

## 1. Preparar o repositório

1. Faça fork ou adicione o repositório `MoneyMap-v3` à sua conta do GitHub.
2. Garanta que o branch `main` contenha as migrações atualizadas (pasta `backend/prisma/migrations`).
3. Confirme que o projeto builda localmente com `npm install`, `npx prisma generate` e `npm run start` dentro da pasta `backend/`.

## 2. Criar o banco MySQL no Render

1. No dashboard do Render, clique em **New ➜ MySQL**.
2. Informe um nome (ex.: `moneymapp-db`) e escolha a região (mantenha a mesma do serviço web).
3. Plano: `Free` é suficiente para testes; produção recomenda `Starter` ou superior para evitar hibernação.
4. Após criar, o Render exibirá:
   - `Host`, `Port`
   - `Database`, `User`, `Password`
   - **Connection string** no formato `mysql://USER:PASSWORD@HOST:PORT/DATABASE`.
5. Copie a connection string e adicione os parâmetros recomendados para Prisma (SSL obrigatório):
   ```
   mysql://USER:PASSWORD@HOST:3306/DATABASE?sslaccept=strict&connection_limit=5&pool_timeout=30
   ```
6. Guarde o valor completo para usar na variável `DATABASE_URL`.

> ⚠️  Se o painel não oferecer MySQL na sua conta, utilize um provedor externo (PlanetScale, Aiven etc.) e apenas aponte o `DATABASE_URL` para aquela instância.

## 3. Criar o serviço backend (Web Service)

1. Ainda no Render, clique em **New ➜ Web Service**.
2. Conecte a sua conta GitHub e selecione o repositório `MoneyMap-v3`.
3. Configurações principais:
   - **Name**: `moneymapp-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Region**: mesma do banco (ex.: `oregon`)
   - **Branch**: `main`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm run start`
   - **Auto Deploy**: mantenha ON para cada push no `main`
   - **Health Check Path**: `/health`
4. Em **Advanced ➜ Post-deploy command**, informe:
   ```
   npx prisma migrate deploy && node prisma/seed.js
   ```
   Isso aplica as migrações pendentes e insere os dados de seed sempre que um deploy for promovido.
5. Configure as variáveis de ambiente (use `Add Environment Variable`):

| Variável | Valor sugerido | Observações |
|----------|----------------|-------------|
| `DATABASE_URL` | (connection string do passo anterior) | Obrigatória para Prisma.
| `JWT_SECRET` | chave segura gerada por você | Nunca commit; utilize valor longo aleatório.
| `FRONTEND_URL` | URL pública do front (ex.: `https://app.seudominio.com`) | Usada para redirecionar em produção.
| `CORS_ORIGINS` | Lista separada por vírgula (`https://app.seudominio.com,https://admin.seudominio.com`) | Limita quem pode chamar a API.
| `LOG_BODY` | `false` (opcional) | Útil para evitar logs sensíveis em produção.
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | conforme provedor | Necessário se desejar e-mails de notificação.
| `STATIC_DIR` | `/opt/render/project/src/frontend/dist` (opcional) | Apenas se for servir o build do front a partir do backend.

> O Render injeta `PORT` automaticamente; não defina manualmente.

6. Salve e acione **Create Web Service**. O Render fará o primeiro deploy.

### Permissões de rede

- O Render cria um "Internal Connection" entre o serviço e o banco automaticamente.
- Se desejar restringir o acesso público do banco, habilite **Private Networking** e garanta que ambos estejam na mesma região.

## 4. Validar o deploy

1. Acompanhe os logs de build e de start no painel.
2. Após o deploy concluir, acesse `https://<nome-do-servico>.onrender.com/health` para validar a conexão com o banco (`{"ok":true}`).
3. Utilize o botão **Shell** do serviço para rodar verificações manuais, por exemplo:
   ```
   npx prisma migrate status
   ```
4. Se precisar reexecutar o seed apenas uma vez, Rode na Shell:
   ```
   node prisma/seed.js
   ```

## 5. Jobs e tarefas recorrentes

- O backend já usa `node-cron` para executar `processRecurringRules` às 02:10 e `generateNotifications` às 07:30 (horário UTC).
- Para garantir execução constante, mantenha o serviço em um plano que **não hiberna** (pelo menos `Starter`).
- Alternativamente, crie **Cron Jobs** no Render que batam nos endpoints `/transacoes/recorrentes/processar` e `/notifications/run-now` via HTTP em horários customizados.

## 6. Opcional: Infraestrutura como código (`render.yaml`)

Se preferir versionar a infraestrutura, adicione um arquivo `render.yaml` na raiz com a base abaixo (ajuste nomes/planos conforme necessário):

```yaml
services:
  - type: web
    name: moneymapp-backend
    env: node
    plan: starter
    rootDir: backend
    region: oregon
    buildCommand: npm install && npx prisma generate
    startCommand: npm run start
    postDeployCommand: npx prisma migrate deploy && node prisma/seed.js
    healthCheckPath: /health
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: moneymapp-db
          property: connectionString
      - key: JWT_SECRET
        sync: false
      - key: FRONTEND_URL
        value: https://app.seudominio.com
      - key: CORS_ORIGINS
        value: https://app.seudominio.com
      - key: LOG_BODY
        value: "false"
      - key: SMTP_HOST
        sync: false
      - key: SMTP_PORT
        sync: false
      - key: SMTP_USER
        sync: false
      - key: SMTP_PASS
        sync: false
      - key: STATIC_DIR
        value: /opt/render/project/src/frontend/dist

databases:
  - name: moneymapp-db
    plan: starter
    region: oregon
    mysql:
      majorVersion: 8
```

> Confirme a sintaxe no [guia de IaC do Render](https://docs.render.com/infrastructure-as-code) — alguns campos (como `plan`) podem variar conforme disponibilidade na sua conta.

## 7. Frontend

- O frontend (`frontend/`) pode ser publicado como **Static Site** no Render ou em outra plataforma (Vercel, Netlify, etc.).
- Certifique-se de apontar `VITE_API_URL` para a URL pública da API (`https://moneymapp-backend.onrender.com`).

## 8. Checklist final

- [ ] Banco MySQL criado e acessível (`DATABASE_URL` testado).
- [ ] Web Service faz build sem erros e responde `200` em `/health`.
- [ ] Migrações/seed aplicados com sucesso.
- [ ] Variáveis sensíveis armazenadas como secrets no Render.
- [ ] CORS configurado para o(s) domínio(s) do frontend.
- [ ] Plano do serviço compatível com a carga e com os cron jobs.

Com isso, o backend e o banco do MoneyMapp estarão rodando no Render. Ajuste limites de plano, monitoramento e backups conforme sua necessidade de produção.

---

## Opção B: Deploy do backend na Vercel (serverless)

A Vercel é ideal para APIs serverless com baixa latência e escala automática, porém **não gerencia bancos de dados MySQL**. Você precisará manter o banco em um provedor externo (Render, PlanetScale, Aiven, Railway etc.).

### 1. Preparar o backend para serverless

Os arquivos `backend/vercel.json` e `backend/src/index.js` já estão ajustados para rodar na Vercel:
- **`vercel.json`**: define o build com `@vercel/node` e roteia todas as requisições para `src/index.js`.
- **`src/index.js`**: condicionalmente executa `app.listen()` apenas fora de produção; em produção, exporta o `app` para a Vercel invocar como função.

### 2. Criar banco de dados externo

- Use um serviço gerenciado (ex.: [PlanetScale](https://planetscale.com), [Aiven MySQL](https://aiven.io), ou o próprio Render).
- Obtenha a `DATABASE_URL` completa com SSL (`mysql://USER:PASS@HOST:PORT/DB?sslaccept=strict`).

### 3. Criar projeto na Vercel

1. Acesse o dashboard da Vercel e clique em **Add New ➜ Project**.
2. Conecte o repositório `MoneyMap-v3` via GitHub.
3. Configurações:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other (ou deixe auto-detect)
   - **Build Command**: `npm install && npx prisma generate`
   - **Output Directory**: deixe vazio (serverless não precisa)
   - **Install Command**: `npm install`
4. **Environment Variables**: adicione pelo menos:
   - `DATABASE_URL` (connection string do banco externo)
   - `JWT_SECRET` (string aleatória longa)
   - `FRONTEND_URL` (URL do frontend na Vercel, ex.: `https://app.seudominio.com`)
   - `CORS_ORIGINS` (domínios permitidos separados por vírgula)
   - `LOG_BODY=false` (opcional)
   - SMTP vars (se desejar e-mails)
5. Clique em **Deploy**.

### 4. Executar migrações

Como a Vercel não oferece "post-deploy command" nativamente para serverless, rode as migrações manualmente após o primeiro deploy:

```bash
# Clone o repo localmente ou use a Vercel CLI
cd backend
DATABASE_URL="mysql://..." npx prisma migrate deploy
DATABASE_URL="mysql://..." node prisma/seed.js
```

Alternativamente, use um **Cron Job externo** (GitHub Actions, Render Cron Job) para aplicar migrações a cada release.

### 5. Limitações de serverless

- **Cron jobs internos (`node-cron`)** não funcionam; configure jobs externos via [Vercel Cron](https://vercel.com/docs/cron-jobs) ou endpoints HTTP batidos periodicamente.
- **Conexões de banco persistentes**: em serverless, cada request pode abrir uma nova conexão. Configure `connection_limit` baixo no Prisma (`?connection_limit=5`) para evitar esgotar o pool do banco.
- **Cold starts**: a primeira requisição pode ter latência adicional; considere "warmup" se necessário.

### 6. Validar o deploy

- Abra `https://<nome-do-projeto>.vercel.app/health` e confirme `{"ok":true}`.
- Teste rotas de autenticação (`/auth/login`) e transações.

---

## Comparação: Render vs Vercel para backend

| Critério | Render | Vercel |
|----------|--------|--------|
| **Tipo** | Servidor persistente | Serverless |
| **Banco gerenciado** | ✅ MySQL nativo | ❌ Requer externo |
| **Cron jobs** | ✅ Nativo | ⚠️ Precisa de config extra |
| **Custo inicial** | Free tier limitado | Free tier generoso |
| **Latência** | Conexão sempre ativa | Cold start ocasional |
| **Escala** | Vertical (upgrade de plano) | Automática horizontal |

**Recomendação**: Use **Render** se precisar de jobs agendados e banco integrado; use **Vercel** se busca simplicidade e escala automática para APIs leves com banco externo.

---

Com ambas as opções documentadas, escolha a que melhor se encaixa no seu caso de uso e siga o fluxo correspondente.
