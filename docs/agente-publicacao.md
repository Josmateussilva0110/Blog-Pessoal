# Agente de publicação

Script que cria projetos e publica atualizações pela API usando uma chave própria
(`AGENT_API_KEY`), sem usar a senha do admin.

## O que a chave pode fazer

| Rota | Chave do agente | Sessão do admin |
|---|---|---|
| `POST /api/projects` (criar projeto) | ✅ | ✅ |
| `POST /api/projects/:id/updates` (criar atualização) | ✅ | ✅ |
| `PUT /api/projects/:id/updates/:updateId` (editar atualização) | ✅ | ✅ |
| Editar/apagar projeto, apagar atualização, perfil, links, configurações | ❌ | ✅ |

Chave errada responde 401 e não cai para o cookie. Para revogar, troque ou apague
`AGENT_API_KEY` no Render.

## Configuração

1. Gere a chave:
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`
2. No Render, adicione `AGENT_API_KEY` com esse valor e faça o redeploy.
3. No `.env` local (raiz ou `backend/`), coloque a mesma `AGENT_API_KEY` e `BLOG_API_URL`
   (ex.: `https://minha-api.onrender.com`).

## Uso

```bash
# Rascunho de projeto a partir de um repositório do GitHub (README + linguagens)
npm run agent -w backend -- draft Josmateussilva0110/meu-app posts/meu-app.md

# Confere sem enviar, depois publica
npm run agent -w backend -- project posts/meu-app.md --dry-run
npm run agent -w backend -- project posts/meu-app.md

# Rascunho de atualização a partir dos commits (sem --since: desde a última release/tag;
# --since aceita tag, sha ou data AAAA-MM-DD)
npm run agent -w backend -- draft-update Josmateussilva0110/meu-app posts/meu-app-v1.2.md --since v1.1.0

# Atualização num projeto existente (pelo slug)
npm run agent -w backend -- update meu-app posts/meu-app-v1.2.md
```

No `draft-update`, commits `feat:`, `fix:`, `perf:` e `refactor:` viram seções; `chore`, `docs`,
`test`, `ci`, `build`, `style` e merges ficam de fora; o resto vai para "Outras mudanças".
O texto sai tão bom quanto as mensagens dos commits, então revise antes de publicar.

O formato dos arquivos está no topo de `backend/scripts/blog-agent.ts`.
Os dados são validados com os mesmos schemas de `@blog/shared` antes de enviar.
