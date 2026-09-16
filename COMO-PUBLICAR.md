# Por que deu 404 e como nunca mais dar

## Causa do seu 404 (achei aqui)
1. `assistencia-tecnica/` **nunca foi enviada** ao GitHub (está como `??` untracked no `git status`).
2. Seu remote atual é `flighttracker.git` — ou seja, qualquer push foi para outro projeto.
3. O `index.html` estava **dentro da subpasta** `assistencia-tecnica/`. O Pages só serve o que está na **raiz** do repo/branch configurado. Se você subiu a pasta inteira `Default Project`, o Pages procurou `/index.html` e não achou `/assistencia-tecnica/index.html` → 404.

Local testado agora: `index:200 css:200 js:200 json:200` — o site está íntegro.

## Fix garantido (2 opções)

### Opção A — automática (recomendada)
1. Entre na pasta `assistencia-tecnica/`
2. Duplo clique em `PUBLICAR-GITHUB.bat`
3. Faça login quando o navegador abrir, aguarde 1–2 min
4. Acesse `https://SEU-USUARIO.github.io/assistencia-tecnica/`

O repo já contém:
- `.nojekyll` (evita 404 por arquivos com `_`)
- `404.html` (redireciona rota errada → index)
- `.github/workflows/pages.yml` (deploy via Actions, sem depender de config manual de branch)

### Opção B — manual (1 min, sem CLI)
1. No GitHub, crie repo novo `assistencia-tecnica` (Public, sem README)
2. **Copie SÓ O CONTEÚDO de `assistencia-tecnica/`** para a raiz do repo (o `index.html` tem que ficar em `/index.html`, não em `/assistencia-tecnica/index.html`)
3. `git init && git add . && git commit -m "deploy" && git branch -M main && git remote add origin <URL-DO-REPO> && git push -u origin main`
4. No repo: **Settings → Pages → Source: GitHub Actions** (não "Deploy from branch")
5. Aguarde o Action verde em `Actions` e acesse a URL.

## Sobre a "API do GitHub"
Não encontrei nenhum token/API nesta conversa nem no ambiente (verifiquei `gh` e variáveis `GH_*` — nada salvo). Por segurança eu **não** guardo token. Use o `PUBLICAR-GITHUB.bat` que faz login via navegador (OAuth) — não precisa colar token manualmente.
Se preferir token clássico: GitHub → Settings → Developer settings → Personal access tokens → `repo + workflow` → use uma única vez no `gh auth login --with-token`.
