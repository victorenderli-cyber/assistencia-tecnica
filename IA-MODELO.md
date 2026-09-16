# 🧠 Modelo de IA no navegador (sem chave, sem servidor)

O site agora tem dois níveis de IA:

1. **Busca simples (sempre ativa):** similaridade por palavras — rápida, funciona em qualquer aparelho, sem download.
2. **Modelo gerado (opcional):** Llama 3.2 rodando 100% no navegador via WebGPU que escreve a resposta em texto, usando seus casos como contexto.

## Como ativar (1x por aparelho)
1. Lateral → **Modelo de IA** → escolha 1B (rápido) ou 3B (melhor)
2. **Ativar modelo** → aguarde o download (~1 GB no 1B) com a barra de progresso
3. Pergunte no campo da IA: a resposta passa a vir gerada pelo modelo, fundamentada nos seus casos

## Requisitos
- Chrome ou Edge atualizados, em PC/notebook com WebGPU (a maioria de 2021+)
- Celulares fracos: o botão avisa "Sem WebGPU" e o site segue na busca simples
- Depois do 1º download, o modelo fica em cache e funciona até offline

## Privacidade
Nada sai do aparelho: modelo, casos e perguntas ficam 100% locais (ou no seu repo GitHub, se conectou o banco compartilhado).

## Arquivos
- `js/ai-model.js` — carregamento (WebLLM via CDN `esm.sh`) + montagem do prompt
- Lógica de resposta em `js/app.js` → `askAI()` (usa modelo se ativo, senão similaridade)
