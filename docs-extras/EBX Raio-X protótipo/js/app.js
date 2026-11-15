// Estado, rotas por hash e telas de cada persona.
(function () {
  var KEY = 'ebx.raiox.v1', D = window.DADOS, MT = window.METODOLOGIA, MOTOR = window.MOTOR;
  var VAZIO = { meta: null, dados: null, lider: null, inic: [], gestor: null, transc: '', rev: { st: 'pendente', nota: '' }, plano: { ok: false, st: {} }, sem: [], dec: '' };
  var AREAS = ['Produção', 'Comercial', 'Administrativo', 'Logística'];
  var TELAS = [['inicio', 'Visão geral'], ['ceo', 'CEO'], ['rh', 'Líder de RH'], ['gestor', 'Gestor de área'], ['bp', 'BP de RH'], ['ebx', 'Consultora EBX'], ['caminho', 'Caminho viável']];
  var S = carregar(), aviso = '';

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function carregar() { try { var t = localStorage.getItem(KEY); if (t) { return Object.assign(clone(VAZIO), JSON.parse(t)); } } catch (e) {} return clone(VAZIO); }
  function salvar(msg) { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} aviso = msg || ''; desenhar(); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  function num(n) { return String(n).replace('.', ','); }
  function li(a) { return a.length ? '<ul>' + a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '<p class="muted sm">Nada aqui por enquanto.</p>'; }
  function opts(lista, atual) { return lista.map(function (o) { var v = o[0] || o, r = o[1] || o; return '<option value="' + esc(v) + '"' + (v === atual ? ' selected' : '') + '>' + esc(r) + '</option>'; }).join(''); }
  function tag(txt, tipo) { return '<span class="tag ' + (tipo || '') + '">' + esc(txt) + '</span>'; }
  function cab(fase, titulo, estado) { return '<div class="head"><h2>' + tag('Fase ' + fase, 'fase') + ' ' + esc(titulo) + '</h2>' + (estado || '') + '</div>'; }
  function trava(fase, titulo, txt) { return '<section class="card lock">' + cab(fase, titulo, tag('Aguardando', 'warn')) + '<p class="muted">' + esc(txt) + '</p></section>'; }

  function fases() {
    var n = MOTOR.fontes(S);
    return [
      { n: 'Metas', quem: 'CEO', ok: !!S.meta, href: '#ceo', falta: 'O CEO responde a entrevista' },
      { n: 'Dados', quem: n + ' de 5 fontes', ok: !!S.dados, href: '#rh', falta: 'O RH envia a base de pessoas' },
      { n: 'Raio-X', quem: 'Motor e EBX', ok: S.rev.st === 'aprovado', href: '#ebx', falta: 'A EBX revisa o diagnóstico' },
      { n: 'Plano e rotina', quem: 'RH e BP', ok: S.plano.ok && S.sem.length > 0, href: S.plano.ok ? '#bp' : '#rh', falta: S.plano.ok ? 'O BP faz o check-in da semana' : 'O RH aprova o plano' },
      { n: 'Resultado', quem: 'CEO', ok: !!S.dec, href: '#ceo', falta: 'O CEO lê o relatório e decide' }
    ];
  }

  // ---------- blocos compartilhados ----------
  function blocoDiag(d) {
    if (!d.causas.length) { return '<p class="say">Com os dados enviados, nenhuma alavanca do mapa passou do limite para a meta escolhida. Envie mais fontes ou revise os limites no mapa EBX.</p>'; }
    var h = '<div class="head"><p class="sm muted">Confiança: ' + d.conf + '% · ' + MOTOR.fontes(S) + ' de 5 fontes</p></div><div class="meter"><i style="width:' + d.conf + '%"></i></div>';
    d.causas.forEach(function (c, i) {
      h += '<div class="box"><div class="head"><h3>' + (i + 1) + '. ' + esc(c.nome) + '</h3>' + tag(c.pts + (c.pts > 1 ? ' evidências' : ' evidência'), c.pts >= 3 ? 'ok' : 'warn') + '</div><p>' + esc(c.causa) + '</p>' + li(c.ev) + '</div>';
    });
    return h;
  }
  function blocoPlano(d) {
    return '<div class="cols3"><div class="box do"><h3>Fazer</h3>' + li(d.fazer) + '</div><div class="box stop"><h3>Parar ou adiar</h3>' + li(d.parar) + '</div><div class="box auto"><h3>Delegar ou automatizar</h3>' + li(d.delegar) + '</div><div class="box keep"><h3>Manter</h3>' + li(d.manter) + '</div></div>';
  }
  function metaTxt() { return S.meta ? MT.metas[S.meta.tipo].nome + (S.meta.alvo ? ' · alvo ' + S.meta.alvo : '') + ' · ' + S.meta.prazo : ''; }
  function ultima() { return S.sem[S.sem.length - 1]; }
  function pctFoco(w) { var t = w.hp + w.ho; return t ? Math.round(w.hp / t * 100) : 0; }

  // ---------- telas ----------
  function tInicio() {
    var f = fases(), prox = f.filter(function (x) { return !x.ok; })[0];
    var h = '<section><h1>Um ciclo completo do Raio-X, persona por persona</h1><p class="muted">Cada pessoa informa a sua parte. O que uma preenche aparece para as outras. Os dados ficam só neste navegador.</p></section>';
    h += prox ? '<section class="card agent"><h2>Próximo passo: ' + esc(prox.falta) + '</h2><div class="btns"><a class="btn primary" href="' + prox.href + '">Abrir a tela</a><button class="btn" data-act="exemplo">Preencher as fases 1 e 2 com o exemplo</button><button class="btn" data-act="zerar">Zerar tudo</button></div></section>'
      : '<section class="card agent"><h2>Ciclo completo. O próximo mês começa com dados novos.</h2><div class="btns"><button class="btn" data-act="zerar">Zerar tudo</button></div></section>';
    var p = [
      ['ceo', 'CEO', 'Responde a entrevista de metas e recebe o relatório mensal.', S.meta ? (S.plano.ok && !S.dec ? 'Relatório aguardando decisão' : 'Em dia') : 'Entrevista pendente'],
      ['rh', 'Líder de RH', 'Envia a base de pessoas, a pesquisa e as iniciativas. Aprova o plano.', !S.dados ? 'Base de pessoas pendente' : (S.plano.ok ? 'Plano aprovado' : 'Plano a aprovar')],
      ['gestor', 'Gestor de área', 'Responde três perguntas sobre a trava do time.', S.gestor ? 'Respondido' : 'Perguntas pendentes'],
      ['bp', 'BP de RH', 'Cola a transcrição das reuniões e faz o check-in semanal.', S.sem.length ? S.sem.length + (S.sem.length > 1 ? ' semanas registradas' : ' semana registrada') : 'Sem check-in'],
      ['ebx', 'Consultora EBX', 'Revisa o diagnóstico antes de chegar ao cliente e mantém o mapa.', S.rev.st === 'aprovado' ? 'Diagnóstico aprovado' : 'Revisão ' + S.rev.st]
    ];
    h += '<section class="grid">' + p.map(function (x) { return '<a class="card" href="#' + x[0] + '" style="text-decoration:none"><div class="head"><h2>' + x[1] + '</h2></div><p class="muted">' + x[2] + '</p>' + tag(x[3]) + '</a>'; }).join('') + '</section>';
    return h;
  }

  function tCeo() {
    var m = S.meta || { tipo: 'receita', alvo: '', prazo: '12 meses', ameaca: '', medida: '' };
    var h = '<section class="card">' + cab(1, 'Entrevista de metas', S.meta ? tag('Respondida', 'ok') : tag('Pendente', 'warn')) +
      '<p class="say">São cinco respostas. Elas orientam tudo o que o Raio-X vai pedir e sugerir ao RH.</p><div class="form">' +
      '<label>Meta número 1 do negócio<select id="m-tipo">' + opts([['receita', 'Crescer receita'], ['margem', 'Melhorar a margem'], ['expansao', 'Abrir nova unidade']], m.tipo) + '</select></label>' +
      '<label>Alvo<input id="m-alvo" placeholder="ex.: 20%" value="' + esc(m.alvo) + '"></label>' +
      '<label>Prazo<select id="m-prazo">' + opts(['3 meses', '6 meses', '12 meses'], m.prazo) + '</select></label>' +
      '<label>O que mais ameaça a meta<select id="m-ameaca">' + opts(['Falta de gente pronta', 'Custo acima do previsto', 'Liderança sobrecarregada', 'Outro'], m.ameaca) + '</select></label>' +
      '<label>Como você vai medir o sucesso<input id="m-medida" placeholder="ex.: receita por vendedor" value="' + esc(m.medida) + '"></label>' +
      '</div><div class="btns"><button class="btn primary" data-act="meta">Salvar respostas</button></div></section>';
    if (!S.plano.ok) { return h + trava(5, 'Relatório mensal', 'O relatório aparece depois que o RH aprova o plano.'); }
    var d = MOTOR.diag(S), w = ultima(), st = S.plano.st, feitas = d.fazer.filter(function (a) { return st[a] === 'Concluída'; }).length, and = d.fazer.filter(function (a) { return st[a] === 'Em andamento'; }).length;
    h += '<section class="card agent">' + cab(5, 'Relatório mensal', S.dec ? tag('Decidido', 'ok') : tag('Aguardando sua decisão', 'warn')) + '<p><b>Meta:</b> ' + esc(metaTxt()) + '</p><div class="cols3">' +
      '<div class="box"><div class="big">' + (w ? pctFoco(w) + '%' : 'sem dado') + '</div><p class="sm muted">do tempo do RH em ações ligadas à meta' + (w ? ', na semana ' + S.sem.length : '. Falta o check-in do BP') + '</p></div>' +
      '<div class="box"><div class="big">' + feitas + ' de ' + d.fazer.length + '</div><p class="sm muted">ações concluídas, ' + and + ' em andamento</p></div>' +
      '<div class="box"><div class="big">' + d.parar.length + '</div><p class="sm muted">iniciativas sem vínculo com a meta</p></div></div>';
    if (d.causas[0]) { h += '<p><b>Causa principal:</b> ' + esc(d.causas[0].causa) + ' Esta é a linha de base. A próxima medição mostra se as ações mexeram no indicador.</p>'; }
    if (d.parar[0]) {
      h += '<h3>Uma decisão para você</h3><p>O Raio-X sugere suspender: <b>' + esc(d.parar[0]) + '</b>.</p>' +
        (S.dec ? '<p class="say">Sua resposta: ' + esc(S.dec) + '.</p>' : '') +
        '<div class="btns"><button class="btn primary" data-act="dec" data-v="Suspender">Suspender</button><button class="btn" data-act="dec" data-v="Manter como está">Manter como está</button></div>';
    } else { h += '<div class="btns"><button class="btn primary" data-act="dec" data-v="Relatório lido">Marcar como lido</button></div>'; }
    return h + '</section>';
  }

  function tRh() {
    var h = '<section class="card">' + cab(2, 'Base de pessoas', S.dados ? tag(S.dados.fonte, 'ok') : tag('Pendente', 'warn')) +
      '<p>Envie um CSV com as colunas <code>area;admissao;desligamento;horas_extras</code>. O Raio-X calcula o que faltar.</p>' +
      '<div class="form"><label>Arquivo CSV<input type="file" id="csv" accept=".csv,text/csv"></label></div><div class="btns"><button class="btn" data-act="base">Usar a base de exemplo (fábrica de 200 pessoas)</button></div>';
    if (S.dados) {
      h += '<div class="scroll"><table><thead><tr><th>Área</th><th class="num">Ativos</th><th class="num">Turnover 12 meses</th><th class="num">Hora extra</th><th class="num">Mais de 3 anos</th></tr></thead><tbody>' +
        Object.keys(S.dados.areas).map(function (k) { var a = S.dados.areas[k]; return '<tr><td>' + esc(k) + '</td><td class="num">' + a.ativos + '</td><td class="num">' + num(a.turn) + '%</td><td class="num">' + num(a.hxp) + '%</td><td class="num">' + a.senior + '%</td></tr>'; }).join('') +
        '</tbody></table></div><p class="sm muted">' + S.dados.linhas + ' linhas lidas. Hora extra em relação a 220 horas mensais por pessoa.</p>';
    }
    h += '</section>';
    var ar = S.dados ? Object.keys(S.dados.areas) : AREAS, L = S.lider || {};
    h += '<section class="card">' + cab(2, 'Pesquisa: nota da liderança por área', S.lider ? tag('Enviada', 'ok') : tag('Opcional')) + '<div class="form">' +
      ar.map(function (a, i) { return '<label>' + esc(a) + ' (0 a 10)<input type="number" min="0" max="10" step="0.1" id="l-' + i + '" data-area="' + esc(a) + '" value="' + esc(L[a] == null ? '' : L[a]) + '"></label>'; }).join('') +
      '</div><div class="btns"><button class="btn primary" data-act="lider">Salvar notas</button><button class="btn" data-act="liderEx">Usar exemplo</button></div></section>';
    h += '<section class="card">' + cab(2, 'Iniciativas atuais do RH', S.inic.length ? tag(S.inic.length + ' listadas', 'ok') : tag('Opcional')) +
      '<label>Uma por linha<textarea id="inic" placeholder="ex.: Roadshow de cultura">' + esc(S.inic.join('\n')) + '</textarea></label><div class="btns"><button class="btn primary" data-act="inic">Salvar iniciativas</button><button class="btn" data-act="inicEx">Usar exemplo</button></div></section>';
    if (!S.meta) { return h + trava(3, 'Raio-X', 'Falta a entrevista do CEO. Sem a meta do negócio, não há o que priorizar.'); }
    if (!MOTOR.fontes(S)) { return h + trava(3, 'Raio-X', 'Envie ao menos uma fonte de dados.'); }
    var d = MOTOR.diag(S), ok = S.rev.st === 'aprovado';
    h += '<section class="card agent">' + cab(3, 'Raio-X para a meta: ' + metaTxt(), ok ? tag('Revisado pela EBX', 'ok') : tag('Revisão EBX ' + S.rev.st, 'warn')) + blocoDiag(d) + (S.rev.nota ? '<p class="say"><b>Nota da EBX:</b> ' + esc(S.rev.nota) + '</p>' : '') + '</section>';
    h += '<section class="card">' + cab(4, 'Plano de prioridades', S.plano.ok ? tag('Aprovado', 'ok') : tag('Rascunho', 'warn')) + blocoPlano(d) +
      (ok ? '' : '<p class="muted sm">Você pode aprovar depois que a EBX revisar o diagnóstico.</p>') +
      '<div class="btns"><button class="btn primary" data-act="plano"' + (ok && d.fazer.length ? '' : ' disabled') + '>' + (S.plano.ok ? 'Reabrir plano' : 'Aprovar plano') + '</button></div></section>';
    return h;
  }

  function tGestor() {
    var g = S.gestor || { area: 'Comercial', trava: 'produto', meses: '', obs: '' };
    return '<section class="card">' + cab(2, 'Três perguntas para o gestor', S.gestor ? tag('Respondido', 'ok') : tag('Pendente', 'warn')) +
      '<p class="say">Leva um minuto. Sua resposta entra como evidência no diagnóstico do RH.</p><div class="form">' +
      '<label>Sua área<select id="g-area">' + opts(S.dados ? Object.keys(S.dados.areas) : AREAS, g.area) + '</select></label>' +
      '<label>Principal trava do time<select id="g-trava">' + opts(Object.keys(MT.travas).map(function (k) { return [k, MT.travas[k]]; }), g.trava) + '</select></label>' +
      '<label>Meses até uma pessoa nova produzir<input type="number" min="0" id="g-meses" value="' + esc(g.meses) + '"></label></div>' +
      '<label>Quer acrescentar algo?<textarea id="g-obs">' + esc(g.obs) + '</textarea></label>' +
      '<div class="btns"><button class="btn primary" data-act="gestor">Enviar respostas</button></div></section>';
  }

  function tBp() {
    var sin = MOTOR.sinais(S.transc), comp = MOTOR.compromissos(S.transc), k = Object.keys(sin);
    var h = '<section class="card">' + cab(2, 'Transcrição de reunião', S.transc ? tag('Enviada', 'ok') : tag('Opcional')) +
      '<label>Cole a transcrição<textarea id="transc">' + esc(S.transc) + '</textarea></label><div class="btns"><button class="btn primary" data-act="transc">Salvar transcrição</button><button class="btn" data-act="transcEx">Usar exemplo</button></div>';
    if (S.transc) {
      h += '<div class="cols3"><div class="box"><h3>Sinais encontrados</h3>' + li(k.map(function (s) { return s + ': ' + sin[s] + (sin[s] > 1 ? ' menções' : ' menção'); })) + '</div><div class="box"><h3>Compromissos</h3>' + li(comp) + '</div></div><p class="sm muted">Extração por palavras-chave. No produto real, um modelo de linguagem lê a transcrição.</p>';
    }
    h += '</section>';
    if (!S.plano.ok) { return h + trava(4, 'Check-in semanal', 'O check-in começa depois que o RH aprova o plano.'); }
    var d = MOTOR.diag(S), w = ultima();
    h += '<section class="card agent">' + cab(4, 'Check-in da semana ' + (S.sem.length + 1)) + '<p class="say">Como andam as prioridades? E para onde foram as suas horas?</p><div class="form">' +
      d.fazer.map(function (a, i) { return '<label>' + esc(a) + '<select id="st-' + i + '" data-acao="' + esc(a) + '">' + opts(['Não iniciada', 'Em andamento', 'Concluída'], S.plano.st[a] || 'Não iniciada') + '</select></label>'; }).join('') +
      '<label>Horas nas prioridades<input type="number" min="0" id="hp" value="12"></label><label>Horas em outras atividades<input type="number" min="0" id="ho" value="24"></label></div>' +
      '<div class="btns"><button class="btn primary" data-act="sem">Registrar semana</button></div>';
    if (w) {
      var p = pctFoco(w);
      h += p < 50 ? '<p class="alert"><b>Alerta:</b> ' + (100 - p) + '% das suas horas da semana ' + S.sem.length + ' foram para atividades fora do plano. Vale rever com a liderança de RH.</p>' : '<p class="say">Semana ' + S.sem.length + ': ' + p + '% das suas horas foram para as prioridades.</p>';
      h += '<div class="scroll"><table><thead><tr><th>Semana</th><th class="num">Prioridades</th><th class="num">Outras</th><th class="num">Foco</th></tr></thead><tbody>' + S.sem.map(function (x, i) { return '<tr><td>' + (i + 1) + '</td><td class="num">' + x.hp + ' h</td><td class="num">' + x.ho + ' h</td><td class="num">' + pctFoco(x) + '%</td></tr>'; }).join('') + '</tbody></table></div>';
    }
    return h + '</section>';
  }

  function tEbx() {
    var h;
    if (!S.meta || !MOTOR.fontes(S)) { h = trava(3, 'Fila de revisão', 'Nenhum diagnóstico na fila. Faltam a meta do CEO e ao menos uma fonte de dados.'); }
    else {
      var d = MOTOR.diag(S);
      h = '<section class="card agent">' + cab(3, 'Revisão do diagnóstico', tag(S.rev.st, S.rev.st === 'aprovado' ? 'ok' : 'warn')) + '<p><b>Meta do cliente:</b> ' + esc(metaTxt()) + '</p>' + blocoDiag(d) + blocoPlano(d) +
        '<label>Nota para o RH do cliente<textarea id="nota" placeholder="ex.: antes do onboarding, alinhe o perfil de contratação com o gestor">' + esc(S.rev.nota) + '</textarea></label>' +
        '<div class="btns"><button class="btn primary" data-act="rev" data-v="aprovado">Aprovar e liberar</button><button class="btn" data-act="rev" data-v="em ajuste">Pedir ajuste</button></div></section>';
    }
    h += '<section class="card"><div class="head"><h2>Mapa EBX: meta, alavanca, indicador e ação</h2>' + (MT.provisoria ? tag('Conteúdo provisório', 'warn') : '') + '</div><p class="muted">É este mapa que o motor aplica. Ele fica em um arquivo só (<code>js/metodologia.js</code>), para a EBX trocar textos, limites e ações sem mexer na lógica.</p><div class="scroll"><table><thead><tr><th>Meta</th><th>Alavanca</th><th>Dispara quando</th><th>Ações</th></tr></thead><tbody>';
    Object.keys(MT.metas).forEach(function (m) {
      MT.metas[m].alavancas.forEach(function (a) {
        var t = a.teste, nomes = { turn: 'Turnover', hx: 'Hora extra', senior: 'Mais de 3 anos de casa', lider: 'Nota da liderança' };
        h += '<tr><td>' + esc(MT.metas[m].nome) + '</td><td>' + esc(a.nome) + '</td><td>' + (t ? esc(nomes[t.ind] + ' em ' + t.area + ' ' + (t.op === '>' ? 'acima de ' : 'abaixo de ') + t.valor) : 'Gestor ou reuniões citam o tema') + '</td><td>' + esc(a.fazer.join('; ')) + '</td></tr>';
      });
    });
    return h + '</tbody></table></div></section>';
  }

  function tCaminho() {
    function etapa(n, t, prazo, itens, crit) { return '<li class="card"><div class="head"><h2>' + n + '. ' + t + '</h2>' + tag(prazo) + '</div>' + li(itens) + '<p class="say"><b>Avança se:</b> ' + crit + '</p></li>'; }
    return '<section><h1>Caminho viável para materializar o Raio-X</h1><p class="muted">Quatro etapas, cada uma com um critério para seguir adiante. Os prazos são estimativas para discutir com Kelly e Larissa.</p></section>' +
      '<section class="cols3"><div class="box do"><h3>Já funciona neste protótipo</h3>' + li(['Leitura de CSV e cálculo de turnover, hora extra e tempo de casa', 'Diagnóstico pelo mapa meta, alavanca e ação', 'Classificação das iniciativas em fazer, parar, delegar e manter', 'Fluxo entre as cinco personas, com revisão da EBX']) + '</div>' +
      '<div class="box stop"><h3>Está simulado</h3>' + li(['Inteligência: aqui são regras e palavras-chave, sem modelo de linguagem', 'Canais: WhatsApp, Teams, e-mail e link de entrevista', 'Coleta orgânica: agenda, assistente de reunião e conectores', 'Login, empresas separadas e dados compartilhados entre pessoas']) + '</div>' +
      '<div class="box auto"><h3>Dá para reaproveitar</h3>' + li(['Identidade e componentes do ERP EBX', 'O padrão de metodologia em arquivo do agente HRBP', 'O servidor MCP de dados de RH', 'Os avisos proativos do ERP']) + '</div></section>' +
      '<ol class="path">' +
      etapa(0, 'Validar o desenho', '2 semanas', ['Mostrar este protótipo a 3 clientes ou mentoradas', 'Kelly e Larissa trocam o mapa provisório pelo real, para 3 metas', 'Definir os dados mínimos que toda empresa consegue entregar'], 'elas reconhecem o diagnóstico como algo que diriam em uma consultoria.') +
      etapa(1, 'Piloto assistido', '4 a 6 semanas', ['2 empresas reais, sem integração: entrevista por formulário e uploads', 'Diagnóstico gerado por IA com o mapa, revisado pela EBX antes de sair', 'Check-in semanal por WhatsApp, operado à mão ou com automação simples', 'Relatório mensal enviado ao CEO por e-mail'], 'o RH muda ao menos uma prioridade e o CEO responde ao relatório.') +
      etapa(2, 'Primeira versão vendável', '2 a 3 meses', ['Portal com login por empresa e papéis por persona', 'Agente com o mapa EBX como ferramenta e leitura de arquivos', 'Link de entrevista, check-in por WhatsApp ou Teams, relatório por e-mail', 'Conector de agenda do Google e da Microsoft', 'Termos de uso de dados e controles de LGPD'], 'os clientes do piloto aceitam pagar para continuar.') +
      etapa(3, 'Coleta orgânica e escala', 'depois', ['Conectores de folha e ponto via MCP', 'Assistente de reunião com consentimento dos participantes', 'Comparação entre empresas, quando houver base suficiente'], 'o custo de integrar um cliente novo cai a cada implantação.') +
      '</ol><section class="card"><h2>Decisões em aberto</h2>' + li(['Quem opera o piloto no dia a dia e quantas horas isso consome da EBX', 'Preço e formato: assinatura, implantação ou os dois', 'Base legal para tratar transcrições e dados de pessoas (LGPD)', 'Como afirmar impacto sem prometer causalidade', 'Como falar de time enxuto sem assustar o usuário de RH']) + '</section>';
  }

  // ---------- ações ----------
  var ACOES = {
    exemplo: function () {
      S.meta = { tipo: 'receita', alvo: '20%', prazo: '12 meses', ameaca: 'Falta de gente pronta', medida: 'Receita por vendedor' };
      S.dados = D.indicadores(D.exemplo(), 'Base de exemplo'); S.lider = { 'Produção': 6.4, 'Comercial': 5.1, 'Administrativo': 7.2, 'Logística': 6.8 };
      S.inic = D.iniciativas.slice(); S.gestor = { area: 'Comercial', trava: 'produto', meses: '4', obs: '' }; S.transc = D.transcricao;
      salvar('Fases 1 e 2 preenchidas com o exemplo.');
    },
    zerar: function () { S = clone(VAZIO); salvar('Tudo zerado.'); },
    meta: function () { S.meta = { tipo: val('m-tipo'), alvo: val('m-alvo'), prazo: val('m-prazo'), ameaca: val('m-ameaca'), medida: val('m-medida') }; salvar('Respostas salvas. O RH já vê a meta.'); },
    base: function () { S.dados = D.indicadores(D.exemplo(), 'Base de exemplo'); salvar('Base de exemplo carregada.'); },
    lider: function () { var o = {}, n = 0; document.querySelectorAll('[data-area]').forEach(function (e) { if (e.value !== '') { o[e.getAttribute('data-area')] = +e.value; n++; } }); S.lider = n ? o : null; salvar('Notas salvas.'); },
    liderEx: function () { S.lider = { 'Produção': 6.4, 'Comercial': 5.1, 'Administrativo': 7.2, 'Logística': 6.8 }; salvar('Notas de exemplo carregadas.'); },
    inic: function () { S.inic = val('inic').split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean); salvar('Iniciativas salvas.'); },
    inicEx: function () { S.inic = D.iniciativas.slice(); salvar('Iniciativas de exemplo carregadas.'); },
    gestor: function () { S.gestor = { area: val('g-area'), trava: val('g-trava'), meses: val('g-meses'), obs: val('g-obs') }; salvar('Respostas enviadas ao RH.'); },
    transc: function () { S.transc = val('transc'); salvar('Transcrição salva.'); },
    transcEx: function () { S.transc = D.transcricao; salvar('Transcrição de exemplo carregada.'); },
    rev: function (b) { S.rev = { st: b.getAttribute('data-v'), nota: val('nota') }; if (S.rev.st !== 'aprovado') { S.plano.ok = false; } salvar(S.rev.st === 'aprovado' ? 'Diagnóstico liberado para o RH.' : 'Ajuste pedido. O plano fica bloqueado.'); },
    plano: function () { S.plano.ok = !S.plano.ok; salvar(S.plano.ok ? 'Plano aprovado. O BP já pode fazer o check-in.' : 'Plano reaberto.'); },
    sem: function () { document.querySelectorAll('[data-acao]').forEach(function (e) { S.plano.st[e.getAttribute('data-acao')] = e.value; }); S.sem.push({ hp: +val('hp') || 0, ho: +val('ho') || 0 }); S.dec = ''; salvar('Semana registrada.'); },
    dec: function (b) { S.dec = b.getAttribute('data-v'); salvar('Decisão registrada.'); }
  };

  function desenhar() {
    var rota = (location.hash || '#inicio').slice(1), mapa = { inicio: tInicio, ceo: tCeo, rh: tRh, gestor: tGestor, bp: tBp, ebx: tEbx, caminho: tCaminho };
    if (!mapa[rota]) { rota = 'inicio'; }
    document.getElementById('nav').innerHTML = TELAS.map(function (t) { return '<a href="#' + t[0] + '"' + (t[0] === rota ? ' aria-current="page"' : '') + '>' + t[1] + '</a>'; }).join('');
    var f = fases(), achou = false;
    document.getElementById('steps').innerHTML = f.map(function (x, i) {
      var agora = !x.ok && !achou; if (agora) { achou = true; }
      return '<a class="step' + (x.ok ? ' ok' : agora ? ' now' : '') + '" href="' + x.href + '"><b>' + (i + 1) + '. ' + x.n + '</b><small>' + esc(x.quem) + '</small><small>' + (x.ok ? 'Concluída' : agora ? 'Agora' : 'A seguir') + '</small></a>';
    }).join('');
    document.getElementById('view').innerHTML = (aviso ? '<p class="say" role="status">' + esc(aviso) + '</p>' : '') + mapa[rota]();
    aviso = '';
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-act]') : null;
    if (b && !b.disabled && ACOES[b.getAttribute('data-act')]) { ACOES[b.getAttribute('data-act')](b); }
  });
  document.addEventListener('change', function (e) {
    if (e.target.id !== 'csv' || !e.target.files[0]) { return; }
    var arq = e.target.files[0], r = new FileReader();
    r.onload = function () {
      try { S.dados = D.indicadores(D.csv(String(r.result)), arq.name); salvar('Arquivo lido e indicadores calculados.'); }
      catch (err) { aviso = 'Não consegui ler o arquivo. ' + err.message; desenhar(); }
    };
    r.readAsText(arq);
  });
  window.addEventListener('hashchange', function () { desenhar(); window.scrollTo(0, 0); });
  desenhar();
})();
