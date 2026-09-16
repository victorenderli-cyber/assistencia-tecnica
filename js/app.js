/* AssiTec RB (Rodeio Bonito) — banco real + IA local. Sem dados inventados. */
const KEY = 'assitec_rb_v1';
const CFG_KEY = 'assitec_rb_cfg';

/* ---- Nuvem (Supabase REST, sem dependências) ---- */
function cfg(){ try{ return JSON.parse(localStorage.getItem(CFG_KEY))||{}; }catch(e){ return {}; } }
const Cloud = {
  get c(){ return cfg(); },
  on(){ const c=this.c; return !!(c.url && c.key); },
  headers(extra={}){ return Object.assign({apikey:this.c.key, Authorization:'Bearer '+this.c.key, 'Content-Type':'application/json'}, extra); },
  url(p){ return this.c.url.replace(/\/$/,'') + '/rest/v1/casos' + p; },
  toRow(d){ return {id:d.id, cliente:d.cliente, data:d.data, classe:d.classe, modelo:d.modelo, defeito:d.defeito, solucao:d.solucao, criado_em:d.criadoEm}; },
  fromRow(r){ return {id:r.id, cliente:r.cliente, data:r.data, classe:r.classe, modelo:r.modelo, defeito:r.defeito, solucao:r.solucao, criadoEm:r.criado_em}; },
  async pull(){
    const r = await fetch(this.url('?select=*&order=criado_em.desc'), {headers:this.headers()});
    if(!r.ok) throw new Error('HTTP '+r.status);
    return (await r.json()).map(this.fromRow);
  },
  async upsert(d){
    const r = await fetch(this.url(''), {method:'POST', headers:this.headers({Prefer:'resolution=merge-duplicates,return=representation'}), body:JSON.stringify(this.toRow(d))});
    if(!r.ok) throw new Error('HTTP '+r.status);
  },
  async remove(id){
    const r = await fetch(this.url('?id=eq.'+encodeURIComponent(id)), {method:'DELETE', headers:this.headers()});
    if(!r.ok) throw new Error('HTTP '+r.status);
  }
};
function cloudStatus(msg, ok){
  const el = $('#cloudStatus'); if(!el) return;
  el.innerHTML = msg; el.className = 'cloud-status ' + (ok===true?'ok':ok===false?'err':'');
}
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const norm = s => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const toks = s => norm(s).replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w=>w.length>2);
const STOP = new Set(['com','para','que','dos','das','uma','isso','esta','esse','foi','sao','como','mais','muito','quando','direto','toda','todo']);

let db = [], fClass='todos', fSearch='', fSort='recentes';

function save(){ localStorage.setItem(KEY, JSON.stringify(db)); }
function load(){ try{ const raw=localStorage.getItem(KEY); if(raw){ db=JSON.parse(raw); return; } }catch(e){} db=[]; }
function esc(s){ return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

/* ---- IA: similaridade ---- */
function score(q, d){
  const qt = toks(q).filter(w=>!STOP.has(w));
  if(!qt.length) return 0;
  const hay = toks([d.defeito,d.solucao,d.modelo,d.cliente,d.classe].join(' '));
  const set = new Set(hay);
  let hit = 0;
  qt.forEach(w=>{ if(set.has(w)) hit+=2; else if(hay.some(h=>h.includes(w)||w.includes(h))) hit+=1; });
  // bônus se mesma classe citada
  if(norm(q).includes(norm(d.classe))) hit+=1;
  return hit / qt.length;
}
function similares(q, n=3){
  return db.map(d=>({d, s:score(q,d)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,n);
}
function topTermos(){
  const freq = {};
  db.forEach(d=>toks(d.defeito).forEach(w=>{ if(!STOP.has(w)) freq[w]=(freq[w]||0)+1; }));
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5);
}

/* ---- render ---- */
function filtered(){
  let l = db.filter(d=>{
    const okC = fClass==='todos'||d.classe===fClass;
    if(!okC) return false;
    if(!fSearch) return true;
    return score(fSearch,d)>0 || norm([d.cliente,d.defeito,d.solucao,d.modelo].join(' ')).includes(norm(fSearch));
  });
  if(fSort==='az') l.sort((a,b)=>a.cliente.localeCompare(b.cliente));
  else if(fSort==='classe') l.sort((a,b)=>a.classe.localeCompare(b.classe));
  else l.sort((a,b)=>(b.criadoEm||0)-(a.criadoEm||0));
  return l;
}
function counts(){
  const c={todos:db.length,CPU:0,Notebook:0,Impressora:0,Outros:0};
  db.forEach(d=>{ if(c[d.classe]!==undefined) c[d.classe]++; });
  $('#cTodos').textContent=c.todos; $('#cCPU').textContent=c.CPU;
  $('#cNotebook').textContent=c.Notebook; $('#cImpressora').textContent=c.Impressora; $('#cOutros').textContent=c.Outros;
  $('#sTotal').textContent=db.length;
  const top = topTermos()[0];
  $('#sTop').textContent = top ? top[0] : '—';
  const comSol = db.filter(d=>d.solucao&&d.solucao.trim()).length;
  $('#sCob').textContent = db.length ? Math.round(comSol/db.length*100)+'%' : '0%';
  const tops = topTermos().map(([w,n])=>`<span class="ins"><i class="fa-solid fa-hashtag"></i>${esc(w)} <b>${n}</b></span>`).join('');
  $('#insights').innerHTML = tops || '<span class="muted">Sem dados ainda</span>';
}
const ICONS={CPU:'fa-tower-observation',Notebook:'fa-laptop',Impressora:'fa-print',Outros:'fa-tablet-screen-button'};
function render(){
  counts();
  const list = filtered();
  $('#resultCount').textContent = list.length+' caso(s)';
  const box = $('#cards'); box.innerHTML='';
  $('#empty').classList.toggle('hidden', list.length>0);
  list.forEach(d=>{
    const rel = fSearch ? similares(fSearch, 99).find(x=>x.d.id===d.id) : null;
    const el = document.createElement('article');
    el.className='card glass ia-card';
    el.innerHTML=`
      <div class="card-top">
        <div><span class="os">${esc(d.data||'')}</span><h3>${esc(d.cliente)}</h3><span class="phone">${esc(d.modelo||'—')}</span></div>
        <span class="badge b-${d.classe}"><i class="fa-solid ${ICONS[d.classe]||'fa-box'}"></i> ${d.classe}</span>
      </div>
      ${rel?`<span class="relev">✨ relevância ${Math.round(Math.min(rel.s,3)/3*100)}%</span>`:''}
      <div class="defeito"><b style="color:#ffb3c0">⚠ Defeito:</b> ${esc(d.defeito)}</div>
      <div class="solucao"><b style="color:#8fffb6">✔ Solução:</b> ${esc(d.solucao)}</div>
      <div class="card-actions">
        <button class="mini" data-act="edit"><i class="fa-solid fa-pen"></i> Editar</button>
        <button class="mini" data-act="similar"><i class="fa-solid fa-wand-magic-sparkles"></i> Casos parecidos</button>
        <button class="mini del" data-act="del"><i class="fa-solid fa-trash"></i></button>
      </div>`;
    el.querySelectorAll('button').forEach(b=>b.onclick=()=>action(b.dataset.act,d.id));
    box.appendChild(el);
  });
}
function action(act,id){
  const d=db.find(x=>x.id===id); if(!d) return;
  if(act==='del'){ if(confirm('Excluir caso de '+d.cliente+'?')){ db=db.filter(x=>x.id!==id); save(); render(); toast('Excluído'); if(Cloud.on()) Cloud.remove(id).catch(()=>toast('Excluído local; nuvem falhou — sincronize')); } }
  if(act==='edit') openModal(d);
  if(act==='similar'){
    const s=similares(d.defeito+' '+d.modelo,4).filter(x=>x.d.id!==id);
    const box=$('#aiAnswer'); box.classList.remove('hidden');
    box.innerHTML = s.length
      ? `<b>✨ Casos parecidos com "${esc(d.defeito)}":</b><br>`+s.map(x=>`• <b>${esc(x.d.cliente)}</b> (${x.d.classe}) — <i>${esc(x.d.defeito)}</i><br><span class="muted">→ ${esc(x.d.solucao)}</span>`).join('<br><br>')
      : 'Nenhum caso parecido ainda.';
    box.scrollIntoView({behavior:'smooth'});
  }
}

/* ---- IA pergunta ---- */
function askAI(q){
  const box=$('#aiAnswer'); box.classList.remove('hidden');
  if(!q.trim()){ box.innerHTML='Digite sua dúvida acima. Ex: "notebook não liga".'; return; }
  const s=similares(q,3);
  if(!s.length){ box.innerHTML=`Não encontrei nada parecido no histórico para "<b>${esc(q)}</b>". Cadastre a solução quando resolver para a IA aprender.`; return; }
  box.innerHTML=`<b>✨ IA encontrou ${s.length} caso(s) para "${esc(q)}":</b><br><br>`+
    s.map((x,i)=>`<b>${i+1}. ${esc(x.d.cliente)}</b> <span class="badge b-${x.d.classe}">${x.d.classe}</span><br><span class="muted">Defeito:</span> ${esc(x.d.defeito)}<br><span class="muted">Solução sugerida:</span> <b>${esc(x.d.solucao)}</b>`).join('<br><br>');
}

/* ---- modal ---- */
function openModal(d){
  $('#modal').classList.remove('hidden');
  const f=$('#caseForm'); f.reset();
  $('#modalTitle').innerHTML = d?'<i class="fa-solid fa-pen"></i> Editar caso':'<i class="fa-solid fa-plus"></i> Novo caso';
  f.id.value=d?.id||''; f.cliente.value=d?.cliente||'';
  f.data.value=d?.data||new Date().toISOString().slice(0,10);
  f.classe.value=d?.classe||'CPU'; f.modelo.value=d?.modelo||'';
  f.defeito.value=d?.defeito||''; f.solucao.value=d?.solucao||'';
  $('#aiSuggest').classList.add('hidden');
}
function closeModal(){ $('#modal').classList.add('hidden'); }
function toast(m){ const t=$('#toast'); t.textContent=m; t.classList.remove('hidden'); setTimeout(()=>t.classList.add('hidden'),2200); }

async function init(){
  load();
  // Banco começa vazio de propósito: sem clientes inventados.
  render();
  $('#classFilter').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; $$('#classFilter button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); fClass=b.dataset.class; render(); });
  document.querySelector('.seg').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; $$('.seg button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); fSort=b.dataset.sort; render(); });
  $('#searchInput').addEventListener('input',e=>{ fSearch=e.target.value; render(); });
  document.addEventListener('keydown',e=>{ if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); $('#searchInput').focus(); } if(e.key==='Escape') closeModal(); });
  $('#aiBtn').onclick=()=>askAI($('#aiInput').value);
  $('#aiInput').addEventListener('keydown',e=>{ if(e.key==='Enter') askAI(e.target.value); });
  // sugestão automática ao digitar defeito no modal
  $('#fDefeito').addEventListener('input',e=>{
    const q=e.target.value; const box=$('#aiSuggest');
    if(q.trim().length<4){ box.classList.add('hidden'); return; }
    const s=similares(q,2);
    if(!s.length){ box.classList.add('hidden'); return; }
    box.classList.remove('hidden');
    box.innerHTML='<b>✨ IA sugere (baseado no histórico):</b>'+s.map(x=>`<button type="button">Usar: "${esc(x.d.solucao.slice(0,90))}..."</button>`).join('');
    box.querySelectorAll('button').forEach((b,i)=>b.onclick=()=>{ document.querySelector('#caseForm').solucao.value=s[i].d.solucao; });
  });
  $('#newBtn').onclick=()=>openModal(null);
  $('#closeModal').onclick=closeModal; $('#cancelBtn').onclick=closeModal;
  $('#modal').addEventListener('click',e=>{ if(e.target.id==='modal') closeModal(); });
  $('#caseForm').addEventListener('submit',e=>{
    e.preventDefault(); const f=e.target;
    const data={id:f.id.value||crypto.randomUUID(),cliente:f.cliente.value.trim(),data:f.data.value||new Date().toISOString().slice(0,10),classe:f.classe.value,modelo:f.modelo.value.trim(),defeito:f.defeito.value.trim(),solucao:f.solucao.value.trim(),criadoEm:Date.now()};
    if(!data.cliente||!data.defeito||!data.solucao) return toast('Preencha cliente, defeito e solução');
    const i=db.findIndex(x=>x.id===data.id);
    if(i>=0){ data.criadoEm=db[i].criadoEm; db[i]=data; } else db.unshift(data);
    save(); render(); closeModal(); toast('Salvo! A IA já aprendeu.');
    if(Cloud.on()) Cloud.upsert(data).then(()=>cloudStatus('☁️ Nuvem conectada', true)).catch(()=>{ cloudStatus('⚠️ Salvo local; nuvem falhou', false); toast('Salvo local; nuvem falhou — sincronize'); });
  });
  $('#exportBtn').onclick=()=>{ const b=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='assitec-rb-historico.json'; a.click(); };
  $('#importFile').addEventListener('change',e=>{ const f=e.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=()=>{ try{ const j=JSON.parse(r.result); if(Array.isArray(j)){ db=j; save(); render(); toast('Importado!'); } }catch{ toast('Arquivo inválido'); } }; r.readAsText(f); });
  const seedBtn=$('#seedBtn'); if(seedBtn) seedBtn.onclick=()=>toast('Banco real: sem exemplos inventados.');
  $('#themeBtn').onclick=()=>document.body.classList.toggle('light');
  // ---- nuvem: preenche config salva, testa e sincroniza ----
  const c0 = cfg();
  if($('#cfgUrl')) $('#cfgUrl').value = c0.url||'';
  if($('#cfgKey')) $('#cfgKey').value = c0.key||'';
  async function syncPull(silent){
    if(!Cloud.on()){ cloudStatus('💾 Banco local (sem nuvem)'); return; }
    cloudStatus('⏳ Sincronizando...');
    try{
      db = await Cloud.pull(); save(); render();
      cloudStatus('☁️ Nuvem conectada • '+db.length+' casos', true);
      if(!silent) toast('Sincronizado com a nuvem!');
    }catch(e){ cloudStatus('⚠️ Nuvem inacessível — usando local', false); }
  }
  const saveCfg = ()=>{
    const url=($('#cfgUrl')?.value||'').trim(), key=($('#cfgKey')?.value||'').trim();
    localStorage.setItem(CFG_KEY, JSON.stringify({url, key}));
    toast(url&&key ? 'Configuração salva. Sincronizando...' : 'Nuvem desativada — usando banco local.');
    syncPull(true);
  };
  if($('#cfgSave')) $('#cfgSave').onclick=saveCfg;
  if($('#cfgSync')) $('#cfgSync').onclick=()=>syncPull(false);
  syncPull(true);
}
document.addEventListener('DOMContentLoaded',init);
