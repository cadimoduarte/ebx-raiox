// Painel da demo: mostra em que fase o ciclo está, abre cada canal e controla o relógio simulado.
(function () {
  var U = RX.ui, st = RX.store, info = [];
  var CANAIS = [
    ['CEO', 'Responde a entrevista e recebe o relatório, sem entrar em sistema.', [['Caixa de e-mail', '/email/?de=ceo'], ['Entrevista por link', '/entrevista/'], ['Relatório mensal', '/relatorio/']]],
    ['Líder de RH', 'Envia os dados, vê o raio-X e aprova o plano.', [['Portal web', '/portal/'], ['Caixa de e-mail', '/email/?de=rh']]],
    ['BP de RH', 'Encaminha transcrições e faz o check-in semanal.', [['Caixa de e-mail', '/email/?de=bp'], ['Check-in por link', '/checkin/'], ['WhatsApp ou Teams (versão 1)', '/mensagens/?de=bp']]],
    ['Gestor de área', 'Responde perguntas curtas sobre a trava do time.', [['Caixa de e-mail', '/email/?de=gestor'], ['Perguntas por link', '/gestor/'], ['WhatsApp ou Teams (versão 1)', '/mensagens/?de=gestor']]],
    ['Consultora EBX', 'Revisa cada diagnóstico e mantém o mapa.', [['Console de revisão', '/console/'], ['Caixa de e-mail', '/email/?de=ebx']]]
  ];
  function desenhar(S) {
    var prox = U.fases(S).filter(function (x) { return !x.ok; })[0];
    var h = '<section><h1>Painel da demo</h1><p class="muted">Cada canal é uma aplicação separada. Todas leem o mesmo estado, então o que uma persona faz aparece nas outras na hora. Abra em abas ou aparelhos diferentes.</p></section>' + U.trilho(S);
    h += '<section class="card agent"><h2>' + (prox ? 'Próximo passo: ' + U.esc(prox.falta) : 'Ciclo completo. Avance o relógio para o próximo.') + '</h2><div class="btns">' +
      (prox ? '<a class="btn primary" href="' + prox.href + '">Abrir o canal</a>' : '') +
      '<button class="btn" data-act="exemplo">Preencher as fases 1 e 2 com o exemplo</button><button class="btn" data-act="zerar">Zerar a demo</button></div></section>';
    h += '<section class="card"><div class="head"><h2>Relógio da demo</h2>' + U.tag('Semana ' + S.semana + ' · mês ' + S.mes) + '</div><p class="muted">No produto, um agendador dispara o check-in semanal e o relatório mensal. Aqui você faz o tempo passar.</p><div class="btns"><button class="btn" data-act="semana"' + (S.plano.ok ? '' : ' disabled') + '>Avançar uma semana</button><button class="btn" data-act="mes"' + (S.plano.ok ? '' : ' disabled') + '>Fechar o mês</button></div>' + (S.plano.ok ? '' : '<p class="sm muted">O relógio começa a contar quando o plano for aprovado.</p>') + '</section>';
    h += '<section class="grid">' + CANAIS.map(function (c) { return '<div class="card"><h2>' + c[0] + '</h2><p class="muted">' + c[1] + '</p><div class="btns">' + c[2].map(function (l) { return '<a class="btn" href="' + l[1] + '">' + l[0] + '</a>'; }).join('') + '</div></div>'; }).join('') + '</section>';
    var ult = S.msgs.slice().sort(function (a, b) { return b.ts - a.ts; }).slice(0, 6);
    h += '<section class="card"><h2>Últimas mensagens enviadas pelo Raio-X</h2><div class="scroll"><table><thead><tr><th>Quando</th><th>Para</th><th>Assunto</th></tr></thead><tbody>' + ult.map(function (m) { return '<tr><td>' + U.hora(m.ts) + '</td><td>' + RX.NOMES[m.para] + '</td><td>' + U.esc(m.assunto) + '</td></tr>'; }).join('') + '</tbody></table></div></section>';
    if (info.length > 1) { h += '<section class="card"><h2>Abrir no celular</h2><p class="muted">Com o celular na mesma rede, abra um destes endereços. Bom para mostrar a entrevista do CEO e o check-in do BP.</p>' + U.li(info.slice(1)) + '</section>'; }
    U.view(h);
  }
  U.acoes({
    exemplo: function () {
      st.mudar(function (S) {
        S.meta = { tipo: 'receita', alvo: '20%', prazo: '12 meses', ameaca: 'Falta de gente pronta', medida: 'Receita por vendedor' };
        S.dados = RX.dados.indicadores(RX.dados.exemplo(), 'Base de exemplo'); S.lider = { 'Produção': 6.4, 'Comercial': 5.1, 'Administrativo': 7.2, 'Logística': 6.8 };
        S.inic = RX.dados.iniciativas.slice(); S.gestor = { area: 'Comercial', trava: 'produto', meses: '4', obs: '' }; S.transc = RX.dados.transcricao;
      });
    },
    zerar: function () { st.zerar(); },
    semana: function () { st.mudar(function (S) { S.semana++; }); },
    mes: function () { st.mudar(function (S) { S.mes++; S.dec = ''; }); }
  });
  U.topo('', 'Painel da demo');
  fetch('/api/info').then(function (r) { return r.json(); }).then(function (j) { info = j.enderecos || []; st.redesenhar(); }).catch(function () {});
  st.iniciar(desenhar);
})();
