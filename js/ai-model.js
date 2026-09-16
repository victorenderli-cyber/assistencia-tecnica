/* AssiTec RB — modelo de IA de verdade rodando no navegador (WebGPU, sem chave, sem servidor).
   Download único na primeira ativação; depois funciona até offline (cache do navegador). */
window.AIModel = {
  engine: null, modelId: null, loading: false,
  MODELS: [
    { id: 'Llama-3.2-1B-Instruct-q4f32_1-MLC', label: 'Llama 3.2 1B — rápido (~1 GB)' },
    { id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC', label: 'Llama 3.2 3B — melhor (~2 GB)' }
  ],
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
  async activate(modelId, onProgress) {
    if (this.engine && this.modelId === modelId) return this.engine;
    if (this.loading) throw new Error('Modelo já está carregando');
    if (!this.supported()) throw new Error('Este aparelho/navegador não tem WebGPU (use Chrome ou Edge atual em PC/notebook)');
    this.loading = true;
    try {
      const mod = await import('https://esm.sh/@mlc-ai/web-llm@0.2.79');
      this.engine = await mod.CreateMLCEngine(modelId, {
        initProgressCallback: (p) => { if (onProgress) onProgress(p); }
      });
      this.modelId = modelId;
      return this.engine;
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
