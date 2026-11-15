// Teste de fluxo: percorre o ciclo inteiro por todas as aplicações com um navegador simulado.
// Rode com: npm test (a partir da raiz do repositório). Falha se alguma tela sair vazia ou com 'undefined'.
process.chdir(require('path').join(__dirname,'..'));let falhas=0;
const fs=require('fs');let estado={rev:0,dados:null};
function mk(app,search,hash){
  const els={},H={};const el=id=>els[id]||(els[id]={innerHTML:'',value:'',files:[],id});
  const w={RX:undefined};const ctx={els,H,el};
  const g={window:null,document:{getElementById:el,querySelectorAll:()=>[],addEventListener:(t,f)=>H[t]=f,activeElement:null},location:{search:search||'',hash:hash||''},history:{replaceState(){}},
   fetch:async(u,o)=>{if(u==='/api/info')return{json:async()=>({enderecos:['a','b']})};if(o&&o.method==='PUT'){estado={rev:estado.rev+1,dados:JSON.parse(o.body).dados};return{json:async()=>({rev:estado.rev})}}return{json:async()=>JSON.parse(JSON.stringify(estado))}},
   EventSource:function(){},URLSearchParams,setTimeout,console,Date,JSON,Object,Array,String,Math,isNaN,parseFloat,FileReader:function(){}};
  g.window=g;g.addEventListener=(t,f)=>H[t]=f;
  const vm=require('vm');const c=vm.createContext(g);
  for(const f of['shared/tema.js','shared/metodologia.js','shared/dados.js','shared/motor.js','shared/fluxo.js','shared/store.js','shared/ui.js',`apps/${app}/app.js`])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});
  ctx.g=g;ctx.act=async(a,v,extra)=>{H.click({target:{closest:()=>({disabled:false,getAttribute:k=>k==='data-act'?a:(extra&&extra[k])||v})}});await new Promise(r=>setTimeout(r,30))};
  ctx.html=()=>el('view').innerHTML;return ctx}
const wait=()=>new Promise(r=>setTimeout(r,40));
function chk(n,h){if(/undefined|NaN|\[object/.test(h)){falhas++;console.log('FALHA',n,(h.match(/.{0,50}(undefined|NaN|\[object).{0,50}/)||[''])[0])}if(!h){falhas++;console.log('VAZIA',n)}}
(async()=>{
  const all=async tag=>{for(const [a,s,h] of [['hub'],['entrevista'],['relatorio'],['portal','','#dados'],['portal','','#raiox'],['portal','','#plano'],['portal','','#time'],['checkin'],['gestor'],['email','?de=ceo'],['email','?de=bp'],['email','?de=rh'],['mensagens','?de=bp'],['mensagens','?de=gestor'],['console']]){const c=mk(a,s,h);await wait();chk(tag+':'+a+(s||'')+(h||''),c.html())}};
  await all('vazio');
  let e=mk('entrevista');await wait();await e.act('resp','receita');e.el('txt').value='20%';await e.act('resp','');await e.act('resp','12 meses');await e.act('resp','Falta de gente pronta');e.el('txt').value='Receita por vendedor';await e.act('resp','');
  console.log('meta',JSON.stringify(estado.dados.meta));await all('meta');
  let p=mk('portal','','#dados');await wait();await p.act('base');await p.act('liderEx');await p.act('inicEx');
  let m=mk('mensagens','?de=gestor');await wait();await m.act('resp','Comercial');await m.act('resp','produto');await m.act('resp','4');console.log('gestor',JSON.stringify(estado.dados.gestor));
  let em=mk('email','?de=bp');await wait();em.el('corpo').value=em.g.RX.dados.transcricao;em.el('anexo').files=[];await em.act('enviar');console.log('transc',estado.dados.transc.length);
  await all('dados');
  let c=mk('console');await wait();c.el('nota').value='Alinhar perfil';await c.act('rev','aprovado');
  p=mk('portal','','#plano');await wait();await p.act('plano');console.log('plano',estado.dados.plano.ok,'semana',estado.dados.semana);
  let b=mk('mensagens','?de=bp');await wait();await b.act('resp','Em andamento');await b.act('resp','8');await b.act('resp','24');console.log('sem',JSON.stringify(estado.dados.sem));
  let hb=mk('hub');await wait();await hb.act('semana');await hb.act('mes');
  let ck=mk('checkin','?semana=2');await wait();ck.el('hp').value='20';ck.el('ho').value='10';await ck.act('enviar','',{'data-n':'2'});console.log('sem',JSON.stringify(estado.dados.sem));
  let r=mk('relatorio');await wait();await r.act('dec','Suspender');
  await all('fim');console.log('msgs',estado.dados.msgs.map(x=>x.para+':'+x.id).join(' '));
  const esperado=['convite','dados','perguntas','transcricoes','fila','liberado','checkin-1','resumo-1','alerta-1','checkin-2','relatorio-1','resumo-2','decisao'];
  for(const id of esperado){if(!estado.dados.msgs.some(m=>m.id===id)){falhas++;console.log('FALTOU mensagem',id)}}
  if(estado.dados.dec!=='Suspender'||estado.dados.sem.length!==2){falhas++;console.log('FALHA estado final')}
  console.log(falhas?falhas+' falha(s)':'ok: ciclo completo sem falhas');process.exit(falhas?1:0);
})();
