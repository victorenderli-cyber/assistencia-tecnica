# 🛠️ TechFix Pro — Assistência Técnica (GitHub Pages Ready)

Site estático, imersivo e prático para gerenciar clientes de assistência técnica, separado por classes:
**CPU • Notebook • Impressora • Outros**

Sem backend, sem custo. O "banco de dados" roda no navegador (localStorage) com seed em `data/clientes.json`.

## ✨ Funcionalidades
- Dashboard com totais, em reparo, prontos e valor em carteira
- Filtros por classe + status + busca instantânea (Ctrl+K) + ordenação
- CRUD completo de OS: cliente, telefone, modelo, defeito, serviço, valor, status, previsão, obs
- Botão WhatsApp automático, impressão de OS, ciclar status em 1 clique
- Exportar JSON / CSV, importar JSON, restaurar exemplos
- Relatório rápido com gráfico, tema dark/light, 100% responsivo
- Layout imersivo: glassmorphism, orbes neon, grid tech

## 🚀 Publicar via GitHub (3 min)
1. Crie um repositório novo no GitHub, ex: `assistencia-tecnica`
2. Suba os arquivos desta pasta (`index.html`, `css/`, `js/`, `data/`):
```bash
git init
git add .
git commit -m "TechFix Pro inicial"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/assistencia-tecnica.git
git push -u origin main
```
3. No GitHub: **Settings → Pages → Deploy from branch → main / (root) → Save**
4. Acesse: `https://SEU-USUARIO.github.io/assistencia-tecnica/`

## 💾 Onde fica o banco?
- `data/clientes.json` = dados iniciais (seed).
- Após abrir o site, tudo é salvo em `localStorage` (`techfix_db_v1`).
- Para "zerar" ou atualizar a base padrão, edite `data/clientes.json` e clique em **Restaurar exemplos** no painel lateral.
- Para backup real multiusuário, evolua para Firebase/Supabase (o `js/app.js` já deixa `db` isolado para trocar o adaptador).

## 📁 Estrutura
```
assistencia-tecnica/
├── index.html
├── css/style.css
├── js/app.js
├── data/clientes.json
└── README.md
```

## 🖨️ Imprimir OS
Botão **OS** em cada card abre comprovante pronto para impressão/assinatura.

Feito para bancadas reais: rápido, visual e sem mensalidade.
