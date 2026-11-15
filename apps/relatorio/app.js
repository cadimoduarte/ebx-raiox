// Canal do CEO: relatório mensal aberto a partir do e-mail, com uma decisão para tomar.
(function () {
  var U = RX.ui, st = RX.store;
  function desenhar(S) {
    if (!S.plano.ok) { return U.view('<section><h1>Relatório mensal</h1></section>' + U.trava('Ainda não há relatório', 'O primeiro relatório sai depois que o RH aprova o plano de prioridades.')); }
    var d = RX.motor.diag(S), w = S.sem[S.sem.length - 1], s = S.plano.st;
    var feitas = d.fazer.filter(function (a) { return s[a] === 'Concluída'; }).length, and = d.fazer.filter(function (a) { return s[a] === 'Em andamento'; }).length;
    var h = '<section><h1>Relatório do RH' + (S.mes ? ': mês ' + S.mes : '') + '</h1><p class="muted">Meta: ' + U.esc(U.metaTxt(S)) + '</p></section><section class="cols3">' +
      '<div class="box"><div class="big">' + (w ? RX.foco(w) + '%' : 'sem dado') + '</div><p class="sm muted">do tempo do RH em ações ligadas à meta' + (w ? ', na semana ' + w.n : '. Falta o check-in do BP') + '</p></div>' +
      '<div class="box"><div class="big">' + feitas + ' de ' + d.fazer.length + '</div><p class="sm muted">ações concluídas, ' + and + ' em andamento</p></div>' +
      '<div class="box"><div class="big">' + d.parar.length + '</div><p class="sm muted">iniciativas sem vínculo com a meta</p></div></section>';
    if (d.causas[0]) { h += '<section class="card agent"><h2>Causa principal</h2><p>' + U.esc(d.causas[0].causa) + '</p><p class="sm muted">Esta é a linha de base. A próxima medição mostra se as ações mexeram no indicador. O relatório indica contribuição provável, não prova de causa.</p></section>'; }
    h += '<section class="card">' + U.cab('Uma decisão para você', S.dec ? U.tag('Respondida', 'ok') : U.tag('Aguardando', 'warn'));
    if (d.parar[0]) { h += '<p>O Raio-X sugere suspender: <b>' + U.esc(d.parar[0]) + '</b>. Ela não tem vínculo com a meta e ocupa a agenda do RH.</p>' + (S.dec ? '<p class="say">Sua resposta: ' + U.esc(S.dec) + '.</p>' : '') + '<div class="btns"><button class="btn primary" data-act="dec" data-v="Suspender">Suspender</button><button class="btn" data-act="dec" data-v="Manter como está">Manter como está</button></div>'; }
    else { h += '<div class="btns"><button class="btn primary" data-act="dec" data-v="Relatório lido">Marcar como lido</button></div>'; }
    U.view(h + '</section>');
  }
  U.acoes({ dec: function (b) { st.mudar(function (S) { S.dec = b.getAttribute('data-v'); }); } });
  U.topo('CEO', 'Relatório mensal, aberto pelo e-mail');
  st.iniciar(desenhar);
})();
