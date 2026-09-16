/* TechFix Pro — banco local (localStorage) + seed JSON. 100% GitHub Pages. */
const KEY = 'techfix_db_v1';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const fmtBRL = v => (Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

let db = [];
let fClass = 'todos', fStatus = 'todos', fSearch = '', fSort = 'recentes';

async function loadSeed(){
  try{
    const r = await fetch('data/clientes.json');
    if(r.ok) return await r.json();
  }catch(e){}
  return [
    {id:crypto.randomUUID(),os:'OS-1001',cliente:'Maria Silva',telefone:'11987654321',classe:'Notebook',modelo:'Dell Inspiron 15 3520',defeito:'Não liga, LED pisca 3x',servico:'Reparo placa + troca RAM 8GB',valor:450,status:'Em reparo',previsao:'2026-09-20',obs:'Senha: 1234',criadoEm:Date.now()-86400000*2},
    {id:crypto.randomUUID(),os:'OS-1002',cliente:'João Pedro',telefone:'21999998888',classe:'CPU',modelo:'Ryzen 5 5600G / B450',defeito:'Desligando sozinho / aquecendo',servico:'Troca pasta térmica + fonte 500W',valor:320,status:'Pronto',previsao:'2026-09-17',obs:'',criadoEm:Date.now()-86400000*4},
    {id:crypto.randomUUID(),os:'OS-1003',cliente:'Padaria Pão Dourado',telefone:'31988887777',classe:'Impressora',modelo:'Epson EcoTank L3250',defeito:'Falha impressão magenta, papel atolando',servico:'Limpeza cabeçote + kit rolete',valor:280,status:'Aguardando',previsao:'2026-09-22',obs:'Peça encomendada',criadoEm:Date.now()-86400000},
    {id:crypto.randomUUID(),os:'OS-1004',cliente:'Ana Costa',telefone:'11977776666',classe:'Outros',modelo:'Monitor LG 24" + Tablet Samsung',defeito:'Monitor sem imagem / tablet tela trincada',servico:'Troca cabo + orçamento tela',valor:150,status:'Entregue',previsao:'2026-09-10',obs:'Garantia 90 dias',criadoEm:Date.now()-86400000*7},
    {id:crypto.randomUUID(),os:'OS-1005',cliente:'Carlos Mota',telefone:'11966665555',classe:'CPU',modelo:'i5 10400F / GTX 1650',defeito:'Lento, HD com bad block',servico:'Upgrade SSD 480GB + formatação W11',valor:520,status:'Em reparo',previsao:'2026-09-18',obs:'Backup feito',criadoEm:Date.now()-3600000*5}
  ];
}
function save(){ localStorage.setItem(KEY, JSON.stringify(db)); }
function load(){
  try{ const raw = localStorage.getItem(KEY); if(raw){ db = JSON.parse(raw); return; } }catch(e){}
  db = [];
}
function nextOS(){
  const nums = db.map(d=>parseInt(String(d.os).replace(/\D/g,''))||1000);
  const max = nums.length?Math.max(...nums):1000;
  return 'OS-'+(max+1);
}
function filtered(){
  let l = db.filter(d=>{
    const okC = fClass==='todos'||d.classe===fClass;
    const okS = fStatus==='todos'||d.status===fStatus;
    const q = fSearch.toLowerCase();
    const okQ = !q || [d.cliente,d.telefone,d.os,d.defeito,d.modelo,d.servico].join(' ').toLowerCase().includes(q);
    return okC&&okS&&okQ;
  });
  if(fSort==='valor') l.sort((a,b)=>(b.valor||0)-(a.valor||0));
  else if(fSort==='az') l.sort((a,b)=>a.cliente.localeCompare(b.cliente));
  else l.sort((a,b)=>(b.criadoEm||0)-(a.criadoEm||0));
  return l;
}
function counts(){
  const c={todos:db.length,CPU:0,Notebook:0,Impressora:0,Outros:0};
  db.forEach(d=>{ if(c[d.classe]!==undefined) c[d.classe]++; });
  $('#cTodos').textContent=c.todos; $('#cCPU').textContent=c.CPU;
  $('#cNotebook').textContent=c.Notebook; $('#cImpressora').textContent=c.Impressora; $('#cOutros').textContent=c.Outros;
  $('#sTotal').textContent=db.length;
  $('#sReparo').textContent=db.filter(d=>d.status==='Em reparo').length;
  $('#sPronto').textContent=db.filter(d=>d.status==='Pronto').length;
  $('#sValor').textContent=fmtBRL(db.filter(d=>d.status!=='Entregue').reduce((s,d)=>s+(+d.valor||0),0));
}
function statusClass(s){ return 's-'+s.replace(' ',''); }
function iconClass(c){ return {CPU:'fa-tower-observation',Notebook:'fa-laptop',Impressora:'fa-print',Outros:'fa-tablet-screen-button'}[c]||'fa-box'; }

function render(){
  counts();
  const list = filtered();
  $('#resultCount').textContent = list.length+' registro(s)';
  const box = $('#cards'); box.innerHTML='';
  $('#empty').classList.toggle('hidden', list.length>0);
  list.forEach(d=>{
    const el = document.createElement('article');
    el.className='card glass';
    el.innerHTML=`
      <div class="card-top">
        <div><span class="os">${d.os} • ${d.previsao||'--/--/--'}</span><h3>${esc(d.cliente)}</h3><span class="phone"><i class="fa-solid fa-phone"></i> ${esc(d.telefone)}</span></div>
        <span class="badge b-${d.classe}"><i class="fa-solid ${iconClass(d.classe)}"></i> ${d.classe}</span>
      </div>
      <span class="status ${statusClass(d.status)}">● ${d.status}</span>
      <div class="defeito"><b>${esc(d.modelo||'—')}</b><br>🛠 ${esc(d.defeito)}${d.servico?`<br><span style="color:#8fffb6">✔ ${esc(d.servico)}</span>`:''}</div>
      <div class="card-meta"><span><i class="fa-regular fa-calendar"></i> ${new Date(d.criadoEm).toLocaleDateString('pt-BR')}</span><span class="valor">${fmtBRL(d.valor)}</span></div>
      <div class="card-actions">
        <button class="mini" data-act="edit"><i class="fa-solid fa-pen"></i> Editar</button>
        <button class="mini wpp" data-act="wpp"><i class="fa-brands fa-whatsapp"></i> Chamar</button>
        <button class="mini" data-act="print"><i class="fa-solid fa-print"></i> OS</button>
        <button class="mini" data-act="cycle"><i class="fa-solid fa-rotate"></i> Status</button>
        <button class="mini del" data-act="del"><i class="fa-solid fa-trash"></i></button>
      </div>`;
    el.querySelectorAll('button').forEach(b=>b.onclick=()=>action(b.dataset.act,d.id));
    box.appendChild(el);
  });
}
function esc(s){ return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

const ORDER=['Aguardando','Em reparo','Pronto','Entregue'];
function action(act,id){
  const d = db.find(x=>x.id===id); if(!d) return;
  if(act==='del'){ if(confirm('Excluir '+d.os+'?')){ db=db.filter(x=>x.id!==id); save(); render(); toast('Excluído'); } }
  if(act==='edit') openModal(d);
  if(act==='cycle'){ d.status=ORDER[(ORDER.indexOf(d.status)+1)%ORDER.length]; save(); render(); toast(d.os+' → '+d.status); }
  if(act==='wpp'){ const f='55'+String(d.telefone).replace(/\D/g,''); open(`https://wa.me/${f}?text=${encodeURIComponent(`Olá ${d.cliente}! Aqui é da assistência — sua ${d.os} (${d.modelo}) está: ${d.status}. Valor: ${fmtBRL(d.valor)}`)}`,'_blank'); }
  if(act==='print'){
    const w=open('','_blank'); w.document.write(`<h1>Ordem de Serviço ${d.os}</h1><p><b>Cliente:</b> ${d.cliente} (${d.telefone})</p><p><b>Equipamento:</b> ${d.classe} — ${d.modelo}</p><p><b>Defeito:</b> ${d.defeito}</p><p><b>Serviço:</b> ${d.servico||'—'}</p><p><b>Valor:</b> ${fmtBRL(d.valor)} | <b>Status:</b> ${d.status} | <b>Previsão:</b> ${d.previsao||'—'}</p><p><b>Obs:</b> ${d.obs||'—'}</p><br><p>Ass. cliente: _______________ &nbsp; Ass. técnico: _______________</p><script>print()<\/script>`);
  }
}

/* MODAL */
function openModal(d){
  $('#modal').classList.remove('hidden');
  const f=$('#osForm'); f.reset();
  $('#modalTitle').innerHTML = d? '<i class="fa-solid fa-pen"></i> Editar '+d.os : '<i class="fa-solid fa-clipboard-list"></i> Nova OS';
  f.id.value=d?.id||''; f.cliente.value=d?.cliente||''; f.telefone.value=d?.telefone||'';
  f.classe.value=d?.classe||'CPU'; f.modelo.value=d?.modelo||''; f.defeito.value=d?.defeito||'';
  f.servico.value=d?.servico||''; f.valor.value=d?.valor||''; f.status.value=d?.status||'Em reparo';
  f.previsao.value=d?.previsao||''; f.obs.value=d?.obs||'';
  $('#osNumber').value=d?.os||nextOS();
}
function closeModal(){ $('#modal').classList.add('hidden'); }

function toast(m){ const t=$('#toast'); t.textContent=m; t.classList.remove('hidden'); setTimeout(()=>t.classList.add('hidden'),2200); }

function drawReport(){
  const box=$('#report'); box.classList.toggle('hidden');
  if(box.classList.contains('hidden')) return;
  const cats=['CPU','Notebook','Impressora','Outros'];
  const vals=cats.map(c=>db.filter(d=>d.classe===c).length);
  const tot=db.reduce((s,d)=>s+(+d.valor||0),0);
  $('#reportText').innerHTML=cats.map((c,i)=>`<div><b>${c}</b>: ${vals[i]} OS</div>`).join('')+`<div><b>Total em carteira:</b> ${fmtBRL(tot)}</div><div><b>Ticket médio:</b> ${fmtBRL(db.length?tot/db.length:0)}</div>`;
  const cv=$('#chartClass'),ctx=cv.getContext('2d');ctx.clearRect(0,0,cv.width,cv.height);
  const max=Math.max(...vals,1);const colors=['#00e5ff','#7c3aed','#ffb020','#22ff88'];
  vals.forEach((v,i)=>{ const h=(v/max)*160; ctx.fillStyle=colors[i]; ctx.fillRect(40+i*135,190-h,90,h); ctx.fillStyle='#fff'; ctx.font='14px Inter'; ctx.fillText(cats[i]+' ('+v+')',40+i*135,208); });
}

async function init(){
  $('#year').textContent=new Date().getFullYear();
  load();
  if(!db.length){ db = await loadSeed(); save(); }
  render();
  $('#osNumber').value=nextOS();

  $('#classFilter').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; $$('#classFilter button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); fClass=b.dataset.class; render(); });
  $('#statusFilter').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; $$('#statusFilter button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); fStatus=b.dataset.status; render(); });
  document.querySelector('.seg').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; $$('.seg button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); fSort=b.dataset.sort; render(); });
  $('#searchInput').addEventListener('input',e=>{ fSearch=e.target.value; render(); });
  document.addEventListener('keydown',e=>{ if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); $('#searchInput').focus(); } if(e.key==='Escape') closeModal(); });

  $('#newBtn').onclick=()=>openModal(null);
  $('#closeModal').onclick=closeModal; $('#cancelBtn').onclick=closeModal;
  $('#modal').addEventListener('click',e=>{ if(e.target.id==='modal') closeModal(); });
  $('#osForm').addEventListener('submit',e=>{
    e.preventDefault(); const f=e.target;
    const data={id:f.id.value||crypto.randomUUID(),os:$('#osNumber').value||nextOS(),cliente:f.cliente.value.trim(),telefone:f.telefone.value.trim(),classe:f.classe.value,modelo:f.modelo.value.trim(),defeito:f.defeito.value.trim(),servico:f.servico.value.trim(),valor:parseFloat(f.valor.value)||0,status:f.status.value,previsao:f.previsao.value,obs:f.obs.value.trim(),criadoEm:Date.now()};
    if(!data.cliente||!data.telefone||!data.defeito) return toast('Preencha os campos obrigatórios');
    const i=db.findIndex(x=>x.id===data.id);
    if(i>=0){ data.criadoEm=db[i].criadoEm; db[i]=data; toast('Atualizado '+data.os); } else { db.unshift(data); toast('OS '+data.os+' criada!'); }
    save(); render(); closeModal();
  });

  $('#exportJsonBtn').onclick=()=>{ const b=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}); dl(URL.createObjectURL(b),'clientes-backup.json'); };
  $('#exportCsvBtn').onclick=()=>{
    const h=['os','cliente','telefone','classe','modelo','defeito','servico','valor','status','previsao','obs'];
    const rows=[h.join(';')].concat(db.map(d=>h.map(k=>`"${String(d[k]??'').replace(/"/g,'""')}"`).join(';')));
    dl(URL.createObjectURL(new Blob(['\ufeff'+rows.join('\n')],{type:'text/csv'})),'clientes.csv');
  };
  function dl(url,name){ const a=document.createElement('a'); a.href=url; a.download=name; a.click(); }
  $('#importFile').addEventListener('change',e=>{
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=()=>{ try{ const j=JSON.parse(r.result); if(Array.isArray(j)){ db=j; save(); render(); toast('Importado '+j.length+' registros'); } }catch{ toast('Arquivo inválido'); } }; r.readAsText(f);
  });
  $('#seedBtn').onclick=async()=>{ if(confirm('Restaurar exemplos?')){ db=await loadSeed(); save(); render(); } };
  $('#wipeBtn').onclick=()=>{ if(confirm('Apagar TODOS os dados?')){ db=[]; save(); render(); } };
  $('#themeBtn').onclick=()=>document.body.classList.toggle('light');
  $('#reportBtn').onclick=drawReport;
}
document.addEventListener('DOMContentLoaded',init);
