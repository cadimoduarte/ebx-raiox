// Grava um vídeo da demo seguindo docs/roteiro-demo.md: sobe o servidor em outra porta, percorre as
// cinco fases em um navegador de verdade e põe legendas e cartões por cima das telas.
// Precisa do Playwright com Chromium instalado na máquina (não é dependência do projeto).
// Atenção: zera o estado da demo (data/state.json).
// Rode com: node scripts/gravar-demo.cjs [pasta de saída]   (padrão: data/video, fora do Git)
// Sai um .webm. Para gerar o MP4 de docs-extras:
//   ffmpeg -i data/video/<arquivo>.webm -c:v libx264 -crf 20 -pix_fmt yuv420p -r 25 -movflags +faststart docs-extras/demo-raio-x.mp4
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const RAIZ = path.join(__dirname, '..'), SAIDA = path.resolve(process.argv[2] || path.join(RAIZ, 'data', 'video'));
const PORTA = 4199, BASE = 'http://localhost:' + PORTA;
// Credencial descartável, válida só para este servidor local de gravação.
const EMAIL = 'video@demo.local', SENHA = 'gravacao';
const HASH = '584661230faa106c21b896042e284e0e359af1ae4ea536e6738cfc20ef43912b';
const L = 1280, A = 720;

// Roda em toda página: cursor visível, legenda no rodapé e cartões de abertura.
function camada() {
  if (!document.documentElement) { return document.addEventListener('DOMContentLoaded', camada); }
  if (window.__rx) { return; }
  var ss = window.sessionStorage;
  function ler(k) { try { return JSON.parse(ss.getItem(k) || 'null'); } catch (e) { return null; } }
  var css = '#rx-cursor{position:fixed;left:0;top:0;width:22px;height:22px;margin:-3px 0 0 -3px;z-index:2147483647;pointer-events:none;transition:transform .12s}' +
    '#rx-cursor.baixo{transform:scale(.8)}' +
    '#rx-onda{position:fixed;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:3px solid #c2569b;z-index:2147483646;pointer-events:none;opacity:0}' +
    '#rx-onda.vai{animation:rxonda .5s ease-out}' +
    '@keyframes rxonda{from{opacity:.9;transform:scale(.3)}to{opacity:0;transform:scale(1.3)}}' +
    '#rx-leg{position:fixed;left:0;right:0;bottom:0;z-index:2147483645;pointer-events:none;background:#1c1c1a;color:#f6f6f4;font:17px/1.35 Inter,system-ui,sans-serif;padding:14px 28px;display:flex;gap:16px;align-items:center;min-height:84px;border-top:3px solid #c2569b}' +
    '#rx-leg b{flex:none;background:#c2569b;color:#fff;font-size:13px;letter-spacing:.04em;padding:5px 10px;border-radius:6px;white-space:nowrap}' +
    '#rx-leg.ponto{background:#33202b}#rx-leg.ponto b{background:#e0b400;color:#1c1c1a}' +
    '#rx-leg:empty{display:none}' +
    '#rx-cartao{position:fixed;inset:0;z-index:2147483646;background:#1c1c1a;color:#f6f6f4;font-family:Inter,system-ui,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:0 110px;gap:18px}' +
    '#rx-cartao .marca{display:flex;gap:10px;align-items:center;font-weight:700;font-size:20px}#rx-cartao .marca i{font-style:normal;background:#f6f6f4;color:#1c1c1a;padding:2px 10px;border-radius:6px;letter-spacing:.08em}' +
    '#rx-cartao .num{color:#c2569b;font-weight:700;font-size:20px;letter-spacing:.06em;text-transform:uppercase}' +
    '#rx-cartao h1{font-size:54px;line-height:1.1;margin:0;font-weight:700}#rx-cartao p{font-size:23px;line-height:1.45;margin:0;color:#c9c8c2;max-width:900px}' +
    '#rx-cartao ul{margin:0;padding-left:26px;font-size:24px;line-height:1.7;color:#f0efec}' +
    'body{padding-bottom:110px !important}';
  var raiz = document.documentElement;
  var st = document.createElement('style'); st.textContent = css; raiz.appendChild(st);
  var cur = document.createElement('div'); cur.id = 'rx-cursor';
  cur.innerHTML = '<svg viewBox="0 0 22 22" width="22" height="22"><path d="M3 2l15 8-6.5 1.8L8.6 19z" fill="#1c1c1a" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  var onda = document.createElement('div'); onda.id = 'rx-onda';
  var leg = document.createElement('div'); leg.id = 'rx-leg';
  var cartao = document.createElement('div'); cartao.id = 'rx-cartao';
  function pos(x, y) { cur.style.left = x + 'px'; cur.style.top = y + 'px'; }
  function e(t) { return String(t).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function pintaLeg() { var l = ler('rxLeg'); leg.className = l && l.ponto ? 'ponto' : ''; leg.innerHTML = l && l.txt ? '<b>' + e(l.fase) + '</b><span>' + e(l.txt) + '</span>' : ''; }
  function pintaCartao() {
    var c = ler('rxCartao'); if (!ss.getItem('rxInicio')) { c = { vazio: true }; }
    if (!c) { cartao.style.display = 'none'; return; }
    cartao.style.display = 'flex';
    cartao.innerHTML = c.vazio ? '' : '<div class="marca"><i>EBX</i><span>Raio-X</span></div>' + (c.num ? '<div class="num">' + e(c.num) + '</div>' : '') + '<h1>' + e(c.titulo) + '</h1>' + (c.sub ? '<p>' + e(c.sub) + '</p>' : '') + (c.itens ? '<ul>' + c.itens.map(function (i) { return '<li>' + e(i) + '</li>'; }).join('') + '</ul>' : '');
  }
  var p = ler('rxPos') || { x: 640, y: 380 }; pos(p.x, p.y);
  [cur, onda, leg, cartao].forEach(function (n) { raiz.appendChild(n); });
  pintaLeg(); pintaCartao();
  window.addEventListener('mousemove', function (ev) { pos(ev.clientX, ev.clientY); ss.setItem('rxPos', JSON.stringify({ x: ev.clientX, y: ev.clientY })); }, true);
  window.addEventListener('mousedown', function (ev) { cur.className = 'baixo'; onda.style.left = ev.clientX + 'px'; onda.style.top = ev.clientY + 'px'; onda.className = ''; void onda.offsetWidth; onda.className = 'vai'; }, true);
  window.addEventListener('mouseup', function () { cur.className = ''; }, true);
  window.__rx = {
    leg: function (l) { ss.setItem('rxLeg', JSON.stringify(l)); pintaLeg(); },
    cartao: function (c) { ss.setItem('rxInicio', '1'); if (c) { ss.setItem('rxCartao', JSON.stringify(c)); } else { ss.removeItem('rxCartao'); } pintaCartao(); }
  };
}

(async () => {
  const servidor = spawn('node', ['server.mjs'], { cwd: RAIZ, env: Object.assign({}, process.env, { PORT: String(PORTA), LOGIN_HASH: HASH }), stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 800));
  const navegador = await chromium.launch();
  const ctx = await navegador.newContext({ viewport: { width: L, height: A }, deviceScaleFactor: 1, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo', colorScheme: 'light', recordVideo: { dir: SAIDA, size: { width: L, height: A } } });
  const r = await ctx.request.post(BASE + '/api/login', { data: { email: EMAIL, senha: SENHA } });
  if (!r.ok()) { throw new Error('login falhou'); }
  // Começa do zero, como pede o roteiro.
  await ctx.request.put(BASE + '/api/state', { data: { dados: null } });
  await ctx.addInitScript(camada);
  const pg = await ctx.newPage();
  pg.setDefaultTimeout(8000);
  pg.on('pageerror', (e) => console.log('ERRO NA PÁGINA', e.message));
  const t0 = Date.now();
  let fase = '';

  const pausa = (ms) => pg.waitForTimeout(ms);
  const leg = async (txt, ms, ponto) => { await pg.evaluate((l) => window.__rx.leg(l), { fase: ponto ? 'Ponto a mostrar' : fase, txt, ponto: !!ponto }); if (ms) { await pausa(ms); } };
  const cartao = (c) => pg.evaluate((x) => window.__rx.cartao(x), c);
  const alvo = (s) => (typeof s === 'string' ? pg.locator(s).first() : s);
  async function mostrar(s) { // traz o elemento para o meio da tela, com rolagem suave
    const l = alvo(s); await l.waitFor({ state: 'visible' });
    await l.evaluate((el) => { var r = el.getBoundingClientRect(), meio = (window.innerHeight - 100) / 2; if (r.top < 70 || r.bottom > window.innerHeight - 130) { window.scrollTo({ top: window.scrollY + r.top + r.height / 2 - meio, behavior: 'smooth' }); } });
    await pausa(650); return l;
  }
  async function mover(s) { const l = await mostrar(s); const b = await l.boundingBox(); await pg.mouse.move(b.x + Math.min(b.width / 2, 120), b.y + b.height / 2, { steps: 28 }); await pausa(250); return l; }
  async function clicar(s, depois) { const l = await mover(s); await pausa(200); await l.click(); await pausa(depois == null ? 900 : depois); }
  async function digitar(s, txt) { const l = await mover(s); await l.click(); await l.fill(''); await pg.keyboard.type(txt, { delay: 38 }); await pausa(400); }
  async function rolar(y, ms) { await pg.evaluate((v) => window.scrollTo({ top: v === 'fim' ? document.body.scrollHeight : v, behavior: 'smooth' }), y); await pausa(ms || 1200); }
  const botao = (nome) => pg.getByRole('button', { name: nome, exact: true });
  const link = (nome) => pg.getByRole('link', { name: nome, exact: true });
  const canal = (href) => '.grid a[href="' + href + '"]';
  async function abertura(num, titulo, sub, nomeFase) {
    await cartao({ num, titulo, sub }); await leg('');
    fase = nomeFase;
    await pg.goto(BASE + '/hub/'); await pausa(3200); await cartao(null); await pausa(500);
  }
  async function painel(txt) { await clicar(link('Painel da demo'), 700); await rolar(0, 300); if (txt) { await leg(txt, 2600); } }

  // Abertura
  await pg.goto(BASE + '/hub/');
  await cartao({ titulo: 'Demonstração navegável', sub: 'Agentes que ligam as metas do negócio ao trabalho do RH e dizem o que fazer, parar e delegar. Um ciclo completo, em cinco fases, com um canal por persona. Protótipo com dados fictícios.' });
  await pausa(5500);
  fase = 'Painel';
  await cartao(null); await pausa(400);
  await leg('O painel mostra a fase do ciclo e abre o canal de cada persona. Todas as telas leem o mesmo estado.', 4200);
  await leg('Antes de começar: "Zerar a demo".', 600);
  await clicar(botao('Zerar a demo'), 1200);

  // 1. Metas
  await abertura('Fase 1 de 5', 'Metas', 'CEO · e-mail e entrevista por link', '1. Metas · CEO');
  await leg('O CEO começa pela própria caixa de e-mail.', 1200);
  await clicar(canal('/email/?de=ceo'), 900);
  await leg('Há um e-mail do Raio-X com o convite para a entrevista de metas.', 3000);
  await clicar(link('Responder a entrevista'), 900);
  await leg('São cinco perguntas, em formato de conversa.', 1500);
  await clicar(botao('Crescer receita'));
  await digitar('#txt', '20%'); await clicar(botao('Enviar'));
  await clicar(botao('12 meses'));
  await clicar(botao('Falta de gente pronta'));
  await digitar('#txt', 'Receita por vendedor'); await clicar(botao('Enviar'), 1200);
  await leg('Respostas registradas. O RH já recebeu a meta do negócio.', 3200);
  await leg('O CEO não entra em sistema nenhum. São cinco minutos por trimestre.', 5000, true);

  // 2. Dados
  await abertura('Fase 2 de 5', 'Dados', 'Líder de RH, gestor de área e BP de RH', '2. Dados · Líder de RH');
  await leg('O trilho avançou: a fase 1 está concluída e a fase 2 é a de agora.', 3000);
  await clicar(canal('/email/?de=rh'), 900);
  await leg('O líder de RH recebeu o aviso de que a meta foi definida.', 2800);
  await clicar(link('Abrir o portal'), 900);
  await leg('Na aba Dados, ele envia a planilha exemplos/base-pessoas.csv.', 800);
  await mover('#csv'); await pausa(500);
  await pg.setInputFiles('#csv', path.join(RAIZ, 'exemplos', 'base-pessoas.csv')); await pausa(900);
  await mostrar('table');
  await leg('O Raio-X lê o arquivo e calcula turnover, hora extra e tempo de casa por área.', 4500);
  await leg('Notas de liderança por área (botão de exemplo).', 300);
  await clicar(botao('Usar exemplo').nth(0), 1600);
  await leg('E as iniciativas atuais do RH, uma por linha.', 300);
  await clicar(botao('Usar exemplo').nth(1), 2200);

  fase = '2. Dados · Gestor de área';
  await painel();
  await clicar(canal('/email/?de=gestor'), 900);
  await leg('O gestor de área recebe três perguntas curtas sobre a trava do time.', 2600);
  await clicar(link('Responder'), 900);
  await mover('#g-area'); await pg.selectOption('#g-area', 'Comercial'); await pausa(500);
  await mover('#g-trava'); await pg.selectOption('#g-trava', 'produto'); await pausa(500);
  await digitar('#g-meses', '4');
  await clicar(botao('Enviar respostas'), 1000);
  await rolar(0, 400);
  await leg('Leva um minuto. A resposta entra como evidência no diagnóstico.', 3000);

  fase = '2. Dados · BP de RH';
  await painel();
  await clicar(canal('/email/?de=bp'), 900);
  await leg('O BP só encaminha a transcrição de uma reunião com gestores, sem formatar.', 2200);
  await clicar(botao('Colar a transcrição de exemplo'), 1800);
  await clicar(botao('Enviar'), 900);
  await rolar(0, 600);
  await leg('Recebido pelo Raio-X: transcrição lida.', 2600);
  await leg('Ninguém precisou saber o que perguntar. O sistema pediu o que precisava e aceita o dado no formato em que ele existe.', 5500, true);

  // 3. Raio-X
  await abertura('Fase 3 de 5', 'Raio-X', 'Consultora EBX · console de revisão', '3. Raio-X · Consultora EBX');
  await leg('Com meta e dados, o motor monta o diagnóstico e ele entra na fila da EBX.', 2800);
  await clicar(canal('/console/'), 900);
  await leg('O diagnóstico traz causas, evidências e grau de confiança.', 2200);
  await rolar(260, 3200);
  await mostrar('.cols3');
  await leg('E o plano proposto: fazer, parar ou adiar, delegar e manter.', 3600);
  await leg('A consultora escreve uma nota para o cliente e libera.', 300);
  await digitar('#nota', 'Antes do onboarding, alinhe o perfil de contratação com o gestor comercial.');
  await clicar(botao('Aprovar e liberar'), 1200);
  await rolar('fim', 1500);
  await leg('No fim da página, o mapa EBX: é ele que o motor aplica. O conteúdo ainda é provisório.', 4500);
  await leg('A EBX revisa antes de o cliente ver. Cada ajuste deveria virar regra no mapa.', 5000, true);

  // 4. Plano e rotina
  await abertura('Fase 4 de 5', 'Plano e rotina', 'Líder de RH e BP de RH', '4. Plano e rotina · Líder de RH');
  await clicar(canal('/portal/'), 800);
  await clicar('a[href="#raiox"]', 800);
  await leg('No portal, o diagnóstico aparece como revisado, com a nota da EBX.', 2200);
  await rolar('fim', 3200);
  await rolar(0, 500);
  await clicar('a[href="#plano"]', 800);
  await leg('Aba Plano: fazer, parar ou adiar, delegar e manter.', 3800);
  await clicar(botao('Aprovar plano'), 1200);
  await rolar(0, 500);
  await leg('Plano aprovado. O BP recebeu o check-in da semana 1.', 2800);

  fase = '4. Plano e rotina · BP de RH';
  await painel();
  await clicar(canal('/email/?de=bp'), 900);
  await leg('Chegou o check-in da semana 1.', 2000);
  await clicar(link('Fazer o check-in'), 900);
  await mover('#st-0'); await pg.selectOption('#st-0', 'Em andamento'); await pausa(600);
  await leg('12 horas nas prioridades e 24 em outras atividades.', 300);
  await digitar('#hp', '12'); await digitar('#ho', '24');
  await clicar(botao('Enviar check-in'), 1200);
  await rolar(0, 400);
  await leg('O alerta volta na hora: a maior parte das horas ficou fora do plano.', 4000);

  fase = '4. Plano e rotina · Líder de RH';
  await painel();
  await clicar(canal('/email/?de=rh'), 900);
  await leg('O líder de RH recebe o resumo da semana.', 2400);
  await clicar(link('Ver o time'), 900);
  await rolar('fim', 800);
  await leg('Na aba Time: andamento das prioridades e foco do BP por semana.', 3800);

  fase = '4. Plano e rotina · versão 1';
  await painel('Para mostrar a versão 1, o relógio simulado avança uma semana.');
  await clicar(botao('Avançar uma semana'), 1200);
  await clicar(canal('/mensagens/?de=bp'), 900);
  await leg('O mesmo check-in, agora dentro de uma conversa de WhatsApp ou Teams, sem link.', 2600);
  await mostrar('.replies');
  await clicar(botao('Em andamento'));
  await clicar(botao('20 horas'));
  await clicar(botao('16 horas'), 1200);
  await rolar('fim', 600);
  await leg('Resposta imediata: 56% das horas foram para as prioridades.', 3200);
  await leg('O check-in devolve algo útil na hora. É isso que mantém o hábito.', 5000, true);

  // 5. Resultado
  await abertura('Fase 5 de 5', 'Resultado', 'CEO · relatório mensal e uma decisão', '5. Resultado · CEO');
  await leg('No painel, "Fechar o mês" dispara o relatório mensal.', 600);
  await clicar(botao('Fechar o mês'), 1400);
  await clicar(canal('/email/?de=ceo'), 900);
  await leg('O relatório chega ao CEO por e-mail.', 2200);
  await clicar(link('Abrir o relatório'), 900);
  await leg('Tempo do RH na meta, ações concluídas e iniciativas sem vínculo com a meta.', 4200);
  await rolar('fim', 1200);
  await leg('A causa principal vem como linha de base e contribuição provável, não como prova de causa.', 4200);
  await leg('E uma decisão que depende do CEO.', 300);
  await clicar(botao('Suspender'), 1400);
  await rolar('fim', 600);
  await leg('Decisão registrada.', 1800);

  fase = '5. Resultado · Líder de RH';
  await painel();
  await clicar(canal('/email/?de=rh'), 900);
  await leg('O líder de RH é avisado da resposta do CEO.', 2200);
  await clicar(link('Ver o plano'), 900);
  await rolar('fim', 800);
  await leg('A decisão do CEO aparece no plano do RH.', 3200);
  await leg('Quem assina o cheque vê o valor do RH em um minuto e participa com uma decisão.', 5000, true);

  // Encerramento
  fase = 'Painel';
  await painel('As cinco fases concluídas. O ciclo recomeça ao avançar o relógio.');
  await pausa(1200);
  await leg('');
  await cartao({ num: 'Para quem assistiu', titulo: 'Perguntas', itens: ['Este diagnóstico se parece com o que vocês diriam em uma consultoria?', 'Que dado faltou para vocês confiarem na causa apontada?', 'Em qual canal o BP de vocês responderia toda semana?', 'O que faria o CEO abrir o relatório no segundo mês?'] });
  await pausa(9000);

  console.log('duração (s):', Math.round((Date.now() - t0) / 1000));
  const video = pg.video();
  await ctx.close();
  console.log('webm:', await video.path());
  await navegador.close();
  servidor.kill();
})().catch((e) => { console.error(e); process.exit(1); });
