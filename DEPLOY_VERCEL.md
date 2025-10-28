# Deploy do frontend MoneyMapp na Vercel

Este guia explica como publicar o aplicativo React/Vite (`frontend/`) na [Vercel](https://vercel.com/), integrando-o à API hospedada no Render (ou outro backend).

## Visão geral

- **Framework**: Vite + React.
- **Build command**: `npm run build`.
- **Diretório de saída**: `dist`.
- **Variáveis de ambiente**: `VITE_API_URL` apontando para o backend (ex.: `https://moneymapp-backend.onrender.com`).
- **Roteamento SPA**: garantir fallback para `index.html` via `vercel.json`.

## 1. Preparação do repositório

1. Garanta que o branch principal está atualizado.
2. Teste localmente:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   O comando deve gerar a pasta `dist/` sem erros.
3. Ajuste `frontend/.env` para usar o backend de produção. Em produção, o valor virá de uma variável na Vercel.

## 2. Criar o projeto na Vercel

1. Acesse o dashboard da Vercel e clique em **Add New ➜ Project**.
2. Conecte sua conta GitHub (ou GitLab/Bitbucket) e selecione o repositório `MoneyMap-v3`.
3. Em **Framework Preset**, escolha **Vite** (a detecção costuma ser automática).
4. Configure:
   - **Root Directory**: `frontend`
   - **Build & Output Settings**:
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install` (padrão)
   - **Node.js Version**: use a versão padrão (atualmente 20.x) ou alinhe com `.nvmrc`, se existir.
   - **Environment Variables**: adicione `VITE_API_URL` com a URL pública do backend (`https://moneymapp-backend.onrender.com` ou domínio próprio).
5. Salve e clique em **Deploy**. O primeiro build rodará automaticamente.

## 3. Variáveis de ambiente e ambientes de preview

- Use **Environment Variables** na Vercel para cada ambiente:
  - **Production**: URL definitiva da API.
  - **Preview**: pode apontar para um backend de staging (ou o mesmo de produção).
  - **Development**: opcional; pode manter `http://localhost:3000` para testes locais com `vercel dev`.
- Sempre que alterar valores em Production, re-trigger um deploy para que os builds usem a nova variável.

## 4. Roteamento SPA (`vercel.json`)

Para garantir que todos os caminhos do app apontem para `index.html`, adicione `frontend/vercel.json` com:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

> Isto evita erros 404 em rotas client-side. Caso existam ativos estáticos específicos (imagens, manifest), eles continuam servidos normalmente.

## 5. Integração com o backend do Render

- Confirme que a API no Render está acessível publicamente (`https://moneymapp-backend.onrender.com`).
- Configure CORS no backend (`CORS_ORIGINS`) para incluir o domínio da Vercel (`https://<projeto>.vercel.app`) e, se houver, domínios customizados.
- Teste o fluxo completo: login, dashboards, chamadas de API.

## 6. Domínio customizado

1. No dashboard do projeto, vá em **Settings ➜ Domains**.
2. Adicione o domínio desejado (ex.: `app.seudominio.com`).
3. Atualize a configuração DNS no seu provedor apontando um registro CNAME para `cname.vercel-dns.com`.
4. A Vercel emite automaticamente certificados SSL.

## 7. Deploy manual ou contínuo

- Cada push para o branch configurado (geralmente `main`) dispara um novo deploy.
- Para testar uma feature branch, abra um Pull Request e utilize o preview gerado automaticamente.
- Se precisar forçar um redeploy com as mesmas fontes, use **Deployments ➜ Redeploy** no dashboard.

## 8. Checklists

- [ ] `npm run build` finaliza sem erros.
- [ ] Variável `VITE_API_URL` configurada no ambiente Production da Vercel.
- [ ] `vercel.json` presente com rewrite para SPA.
- [ ] Backend Render atualizado com CORS incluindo o domínio da Vercel.
- [ ] Domínio customizado (opcional) apontando para a Vercel.

Com esses passos, o frontend do MoneyMapp estará disponível na Vercel, consumindo a API hospedada no Render. Ajuste as configurações conforme necessidade (Analytics, log de requests, headers de cache, etc.).
