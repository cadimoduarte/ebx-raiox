// Canal da versão 1: o mesmo fluxo do e-mail, dentro de uma conversa de WhatsApp ou Teams.
(function () {
  var U = RX.ui, st = RX.store, MT = RX.METODOLOGIA, de = new URLSearchParams(location.search).get('de') === 'gestor' ? 'gestor' : 'bp', passo = 0, resp = [];
  var AREAS = ['Produção', 'Comercial', 'Administrativo', 'Logística'];
  function roteiro(S) {
    if (de === 'gestor') {
      if (!S.meta || S.gestor) { return null; }
      return [['Em qual área você lidera?', (S.dados ? Object.keys(S.dados.areas) : AREAS).map(function (a) { return [a, a]; })], ['Qual é a principal trava do seu time hoje?', Object.keys(MT.travas).map(function (k) { return [k, MT.travas[k]]; })], ['Quanto tempo uma pessoa nova leva para produzir?', [['2', '1 a 2 meses'], ['4', '3 a 4 meses'], ['6', '5 meses ou mais']]]];
    }
    if (!S.plano.ok || S.sem.some(function (w) { return w.n === S.semana; })) { return null; }
    var d = RX.motor.diag(S), acao = d.fazer.filter(function (a) { return S.plano.st[a] !== 'Concluída'; })[0] || d.fazer[0];
    return [['Check-in da semana ' + S.semana + '. Como está a prioridade "' + acao + '"?', [['Não iniciada', 'Não iniciada'], ['Em andamento', 'Em andamento'], ['Concluída', 'Concluída']], acao], ['Quantas horas você dedicou às prioridades nesta semana?', [['4', '4 horas'], ['8', '8 horas'], ['12', '12 horas'], ['20', '20 horas']]], ['E a outras atividades?', [['8', '8 horas'], ['16', '16 horas'], ['24', '24 horas'], ['32', '32 horas']]]];
  }
  function desenhar(S) {
    var r = roteiro(S), h = '<section><h1>Mensagens</h1><p class="muted">Versão 1: o Raio-X conversa com BP e gestor no WhatsApp ou no Teams, sem link. No piloto, o mesmo fluxo vai por e-mail.</p></section>';
    h += '<div class="tabs"><button class="btn" data-act="de" data-v="bp" aria-pressed="' + (de === 'bp') + '">BP de RH</button><button class="btn" data-act="de" data-v="gestor" aria-pressed="' + (de === 'gestor') + '">Gestor de área</button></div><section class="card"><div class="chat">';
    var antigas = S.msgs.filter(function (m) { return m.para === de; }).sort(function (a, b) { return a.ts - b.ts; }).slice(-3);
    antigas.forEach(function (m) { h += '<div class="msg"><b>' + U.esc(m.assunto) + '</b><br>' + U.esc(m.corpo) + '</div>'; });
    if (!r) {
      var w = S.sem[S.sem.length - 1];
      if (de === 'bp' && w) { var p = RX.foco(w); h += '<div class="msg me">Check-in da semana ' + w.n + ' enviado</div><div class="msg">' + (p < 50 ? 'Alerta: ' + (100 - p) + '% das suas horas ficaram fora do plano. Quer que eu reserve duas manhãs para a prioridade número 1?' : p + '% das suas horas foram para as prioridades. Bom ritmo.') + '</div>'; }
      if (de === 'gestor' && S.gestor) { h += '<div class="msg me">' + U.esc(MT.travas[S.gestor.trava]) + '</div><div class="msg">Registrado. O RH volta com uma proposta para o seu time.</div>'; }
      h += '</div><p class="sm muted">Sem perguntas pendentes.</p></section>';
      return U.view(h);
    }
    for (var i = 0; i < passo; i++) { h += '<div class="msg">' + U.esc(r[i][0]) + '</div><div class="msg me">' + U.esc(r[i][1].filter(function (o) { return o[0] === resp[i]; })[0][1]) + '</div>'; }
    h += '<div class="msg">' + U.esc(r[passo][0]) + '</div><div class="replies">' + r[passo][1].map(function (o) { return '<button class="btn" data-act="resp" data-v="' + U.esc(o[0]) + '">' + U.esc(o[1]) + '</button>'; }).join('') + '</div></div></section>';
    U.view(h);
  }
  U.acoes({
    de: function (b) { de = b.getAttribute('data-v'); passo = 0; resp = []; history.replaceState(null, '', '?de=' + de); st.redesenhar(); },
    resp: function (b) {
      var r = roteiro(st.get()); resp[passo] = b.getAttribute('data-v');
      if (passo < r.length - 1) { passo++; return st.redesenhar(); }
      var a = resp.slice(), acao = r[0][2]; passo = 0; resp = [];
      st.mudar(function (S) {
        if (de === 'gestor') { S.gestor = { area: a[0], trava: a[1], meses: a[2], obs: '' }; return; }
        S.plano.st[acao] = a[0]; S.sem.push({ n: S.semana, hp: +a[1], ho: +a[2] }); S.sem.sort(function (x, y) { return x.n - y.n; });
      });
    }
  });
  U.topo('', 'WhatsApp ou Teams simulado');
  st.iniciar(desenhar);
})();
