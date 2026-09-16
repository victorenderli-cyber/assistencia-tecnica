# ☁️ Banco compartilhado via GitHub (sem conta nova)

Cada salvamento no site vira um **commit** em `data/clientes.json`. Todos os aparelhos conectados veem os mesmos casos.

## 1. Criar o token (3 min, 1x)
1. GitHub → foto de perfil → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**
2. Preencha:
   - **Token name:** `assitec-rb-site`
   - **Expiration:** 90 dias (ou sem expiração, por sua conta)
   - **Repository access:** *Only select repositories* → `assistencia-tecnica`
   - **Permissions → Repository → Contents:** *Read and write*
3. **Generate token** → copie o texto `github_pat_...` (só aparece 1x!)

> Vale também um token clássico com escopo `repo`, mas o fine-grained acima é o mais seguro (só mexe neste repo).

## 2. Conectar o site (30 seg, em cada aparelho)
1. Abra o site → lateral → **Banco compartilhado**
2. Cole o token (+ confira dono/repo) → **Conectar**
3. Status: **☁️ GitHub conectado**. Pronto: salvar num aparelho aparece nos outros após **Sincronizar** (ou recarregar).

## 3. Avisos honestos
- **Delay:** o commit é instantâneo na API, mas o deploy do Pages rebuilda em ~30s. Leitura entre aparelhos usa a API (sempre fresca), não o site publicado.
- **Conflito:** se 2 pessoas salvarem ao mesmo tempo, o site relê, junta por `id` e tenta de novo 1x sozinho.
- **Segurança:** o token fica no navegador de cada aparelho. Quem tiver o aparelho tem acesso de escrita ao repo — use bloqueio de tela. Para revogar: GitHub → tokens → Delete.
- **Sem token:** o site continua 100% no banco local + export/import de JSON.
