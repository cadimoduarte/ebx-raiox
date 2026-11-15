// Canal do BP no piloto: check-in semanal aberto por um link no e-mail.
(function () {
  var U = RX.ui, st = RX.store, pedido = +new URLSearchParams(location.search).get('semana') || 0;
  function desenhar(S) {
    var h = '<section><h1>Check-in semanal</h1></section>';
    if (!S.plano.ok) { return U.view(h + U.trava('Ainda não há plano', 'O check-in começa depois que o líder de RH aprova o plano de prioridades.')); }
    var n = pedido || S.semana, d = RX.motor.diag(S), feito = S.sem.filter(function (w) { return w.n === n; })[0];
    if (feito) {
      var p = RX.foco(feito);
      h += '<section class="card agent">' + U.cab('Semana ' + n, U.tag('Registrado', 'ok')) + (p < 50 ? '<p class="alert"><b>Alerta:</b> ' + (100 - p) + '% das suas horas foram para atividades fora do plano. Vale rever com a liderança de RH.</p>' : '<p class="say">' + p + '% das suas horas foram para as prioridades. Bom ritmo.</p>') + '<div class="btns"><button class="btn" data-act="refazer" data-n="' + n + '">Corrigir a resposta</button></div></section>';
      return U.view(h);
    }
    h += '<section class="card">' + U.cab('Semana ' + n) + '<p class="say">Como andam as prioridades? E para onde foram as suas horas?</p><div class="form">' +
      d.fazer.map(function (a, i) { return '<label>' + U.esc(a) + '<select id="st-' + i + '" data-acao="' + U.esc(a) + '">' + U.opts(['Não iniciada', 'Em andamento', 'Concluída'], S.plano.st[a] || 'Não iniciada') + '</select></label>'; }).join('') +
      '<label>Horas nas prioridades<input type="number" min="0" id="hp" value="12"></label><label>Horas em outras atividades<input type="number" min="0" id="ho" value="24"></label></div><div class="btns"><button class="btn primary" data-act="enviar" data-n="' + n + '">Enviar check-in</button></div></section>';
    U.view(h);
  }
  U.acoes({
    enviar: function (b) {
      var n = +b.getAttribute('data-n'), hp = +U.val('hp') || 0, ho = +U.val('ho') || 0, sts = {};
      document.querySelectorAll('[data-acao]').forEach(function (e) { sts[e.getAttribute('data-acao')] = e.value; });
      st.mudar(function (S) { Object.assign(S.plano.st, sts); S.sem = S.sem.filter(function (w) { return w.n !== n; }); S.sem.push({ n: n, hp: hp, ho: ho }); S.sem.sort(function (a, c) { return a.n - c.n; }); });
    },
    refazer: function (b) { var n = +b.getAttribute('data-n'); st.mudar(function (S) { S.sem = S.sem.filter(function (w) { return w.n !== n; }); S.msgs = S.msgs.filter(function (m) { return m.id !== 'resumo-' + n && m.id !== 'alerta-' + n; }); }); }
  });
  U.topo('BP de RH', 'Check-in por link no e-mail');
  st.iniciar(desenhar);
})();
