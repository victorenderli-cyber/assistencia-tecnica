/* TechFix simples — sem histórico, sem banco. Só gera OS na hora. */
const $ = s => document.querySelector(s);
let classe = 'CPU';
const fmtBRL = v => (Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

function dados(){
  const f = $('#osForm');
  return {
    os: 'OS-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random()*9000)+1000),
    cliente: f.cliente.value.trim(),
    telefone: f.telefone.value.trim(),
    modelo: f.modelo.value.trim(),
    defeito: f.defeito.value.trim(),
    valor: parseFloat(f.valor.value)||0,
    previsao: f.previsao.value,
    obs: f.obs.value.trim(),
    classe
  };
}
function valido(d){
  if(!d.cliente || !d.telefone || !d.defeito){ alert('Preencha cliente, telefone e defeito.'); return false; }
  return true;
}
function imprimir(d){
  const w = open('','_blank');
  w.document.write(`<meta charset="utf-8"><title>${d.os}</title>
  <style>body{font-family:Arial;padding:32px;color:#111}h1{border-bottom:3px solid #111;padding-bottom:8px}.box{border:1px solid #999;border-radius:10px;padding:14px;margin:12px 0}.sig{display:flex;gap:40px;margin-top:40px}.sig div{flex:1;border-top:1px solid #333;padding-top:6px;text-align:center}</style>
  <h1>Ordem de Serviço ${d.os}</h1>
  <div class="box"><b>Cliente:</b> ${d.cliente} (${d.telefone})<br><b>Equipamento:</b> ${d.classe} — ${d.modelo||'—'}<br><b>Defeito:</b> ${d.defeito}</div>
  <div class="box"><b>Valor:</b> ${fmtBRL(d.valor)} &nbsp;|&nbsp; <b>Previsão:</b> ${d.previsao||'—'}<br><b>Obs:</b> ${d.obs||'—'}</div>
  <p>Garantia de 90 dias para o serviço executado.</p>
  <div class="sig"><div>Ass. cliente</div><div>Ass. técnico</div></div>
  <script>print()<\/script>`);
}
document.addEventListener('DOMContentLoaded', ()=>{
  $('#classPick').addEventListener('click', e=>{
    const b = e.target.closest('button'); if(!b) return;
    document.querySelectorAll('#classPick button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); classe = b.dataset.class;
  });
  $('#printBtn').onclick = ()=>{ const d = dados(); if(valido(d)) imprimir(d); };
  $('#wppBtn').onclick = ()=>{
    const d = dados(); if(!valido(d)) return;
    const f = '55' + d.telefone.replace(/\D/g,'');
    open(`https://wa.me/${f}?text=${encodeURIComponent(`Olá ${d.cliente}! Aqui é da assistência — ${d.os} (${d.classe} ${d.modelo}) registrada. Defeito: ${d.defeito}. Valor: ${fmtBRL(d.valor)}. Previsão: ${d.previsao||'a combinar'}.`)}`,'_blank');
  };
  $('#themeBtn').onclick = ()=>document.body.classList.toggle('light');
});
