/* AssiTec RB — modelo de IA de verdade rodando no navegador (WebGPU, sem chave, sem servidor).
   Download único na primeira ativação; depois funciona até offline (cache do navegador). */
window.AIModel = {
  engine: null, modelId: null, loading: false,
  MODELS: [
    { id: 'Llama-3.2-1B-Instruct-q4f32_1-MLC', label: 'Llama 3.2 1B — rápido (~1 GB)' },
    { id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC', label: 'Llama 3.2 3B — melhor (~2 GB)' }
  ],
  // Cadeia de CDNs: se o build de um falhar (ex: cache corrompido), tenta o próximo
  CDNS: [
    'https://esm.sh/@mlc-ai/web-llm@0.2.79',
    'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.79/+esm'
  ],
  _import(url) { return import(url); },
  supported() {
    try { return typeof navigator !== 'undefined' && !!navigator.gpu; } catch (e) { return false; }
  },
  esc(s){ return String(s ?? '').replace(/[<>&]/g, m => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[m])); },
  buildPrompt(question, cases) {
    const ctx = cases.length
      ? cases.map((d, i) => `${i + 1}. Cliente: ${d.cliente} | Classe: ${d.classe} | Modelo: ${d.modelo || '—'}\n   Defeito: ${d.defeito}\n   Solução: ${d.solucao}`).join('\n')
      : '(nenhum caso registrado ainda)';
    return [
      { role: 'system', content: 'Você é o assistente técnico da Assistec Informática (Rodeio Bonito/RS). Responda SEMPRE em português do Brasil, de forma direta e prática. Use APENAS os casos do histórico abaixo como base para a solução. Se nenhum caso ajudar, diga claramente que não há registro e oriente a cadastrar o caso com a solução encontrada para a IA aprender.' },
      { role: 'user', content: `Dúvida: ${question}\n\nHistórico de casos:\n${ctx}` }
    ];
  },
  friendlyError(e) {
    const m = String((e && e.message) || e || '');
    if (/artifactcache/i.test(m)) return 'Motor da IA falhou ao carregar (arquivo em cache corrompido ou bloqueador de conteúdo). Recarregue com Ctrl+F5, desative extensões tipo adblock nesta página e tente de novo.';
    if (/webgpu|gpu/i.test(m)) return m;
    if (/failed to fetch|network|load/i.test(m)) return 'Falha de rede ao baixar o motor/modelo da IA. Confira a internet e tente de novo.';
    return m || 'Falha desconhecida ao ativar o modelo.';
  },
  async activate(modelId, onProgress) {
    if (this.engine && this.modelId === modelId) return this.engine;
    if (this.loading) throw new Error('Modelo já está carregando');
    if (!this.supported()) throw new Error('Este aparelho/navegador não tem WebGPU (use Chrome ou Edge atual em PC/notebook)');
    this.loading = true;
    const errors = [];
    try {
      for (const cdn of this.CDNS) {
        try {
          if (onProgress) onProgress({ progress: 0, text: 'Conectando ' + new URL(cdn).hostname + '...' });
          const mod = await this._import(cdn);
          if (!mod.CreateMLCEngine) throw new Error('CDN sem CreateMLCEngine');
          this.engine = await mod.CreateMLCEngine(modelId, {
            initProgressCallback: (p) => { if (onProgress) onProgress(p); }
          });
          this.modelId = modelId;
          return this.engine;
        } catch (e) {
          errors.push(new URL(cdn).hostname + ': ' + ((e && e.message) || e));
          this.engine = null;
        }
      }
      throw new Error(this.friendlyError(errors.join(' | ')));
    } finally { this.loading = false; }
  },
  async ask(question, cases) {
    if (!this.engine) throw new Error('Modelo não ativado');
    const chunks = await this.engine.chat.completions.create({
      messages: this.buildPrompt(question, cases),
      temperature: 0.3, max_tokens: 400
    });
    return chunks.choices[0].message.content;
  }
};
