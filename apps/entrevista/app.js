// Canal do CEO: entrevista de metas por link, sem login, em formato de conversa.
(function () {
  var U = RX.ui, st = RX.store, passo = 0, resp = {}, refazer = false;
  var P = [
    { k: 'tipo', q: 'Qual é a meta número 1 do negócio neste trimestre?', o: [['receita', 'Crescer receita'], ['margem', 'Melhorar a margem'], ['expansao', 'Abrir nova unidade']] },
    { k: 'alvo', q: 'Qual é o alvo? Um número basta.', txt: 'ex.: 20%' },
    { k: 'prazo', q: 'Em quanto tempo?', o: [['3 meses', '3 meses'], ['6 meses', '6 meses'], ['12 meses', '12 meses']] },
    { k: 'ameaca', q: 'O que mais ameaça essa meta hoje?', o: [['Falta de gente pronta', 'Falta de gente pronta'], ['Custo acima do previsto', 'Custo acima do previsto'], ['Liderança sobrecarregada', 'Liderança sobrecarregada']] },
    { k: 'medida', q: 'Como você vai saber que deu certo?', txt: 'ex.: receita por vendedor' }
  ];
  function rotulo(p, v) { if (!p.o) { return v; } var a = p.o.filter(function (x) { return x[0] === v; })[0]; return a ? a[1] : v; }
  function desenhar(S) {
    var h = '<section><h1>Entrevista de metas</h1><p class="muted">Cinco perguntas. Suas respostas orientam o que o RH vai priorizar.</p></section>';
    if (S.meta && !refazer) {
      h += '<section class="card agent">' + U.cab('Respostas registradas', U.tag('Concluída', 'ok')) + '<p><b>' + U.esc(U.metaTxt(S)) + '</b></p><p class="muted">Ameaça: ' + U.esc(S.meta.ameaca) + '. Medida de sucesso: ' + U.esc(S.meta.medida || 'não informada') + '.</p><p class="say">Obrigado. O RH já recebeu a sua meta. No fim do mês você recebe um relatório por e-mail.</p><div class="btns"><button class="btn" data-act="refazer">Responder de novo</button></div></section>';
      return U.view(h);
    }
    h += '<section class="card"><div class="chat">';
    for (var i = 0; i < passo; i++) { h += '<div class="msg">' + P[i].q + '</div><div class="msg me">' + U.esc(rotulo(P[i], resp[P[i].k])) + '</div>'; }
    var p = P[passo];
    h += '<div class="msg">' + p.q + '</div>';
    if (p.o) { h += '<div class="replies">' + p.o.map(function (o) { return '<button class="btn" data-act="resp" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>'; }
    else { h += '<label>Sua resposta<input id="txt" placeholder="' + p.txt + '"></label><div class="btns"><button class="btn primary" data-act="resp">Enviar</button></div>'; }
    h += '</div><p class="sm muted">Pergunta ' + (passo + 1) + ' de ' + P.length + '</p></section>';
    U.view(h);
  }
  U.acoes({
    refazer: function () { refazer = true; passo = 0; resp = {}; st.redesenhar(); },
    resp: function (b) {
      resp[P[passo].k] = b.getAttribute('data-v') || U.val('txt');
      if (passo < P.length - 1) { passo++; return st.redesenhar(); }
      refazer = false; passo = 0;
      st.mudar(function (S) { S.meta = resp; resp = {}; });
    }
  });
  U.topo('CEO', 'Entrevista por link, sem login');
  st.iniciar(desenhar);
})();
