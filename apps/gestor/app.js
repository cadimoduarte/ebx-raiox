// Canal do gestor no piloto: três perguntas abertas por um link no e-mail.
(function () {
  var U = RX.ui, st = RX.store, MT = RX.METODOLOGIA, AREAS = ['Produção', 'Comercial', 'Administrativo', 'Logística'];
  function desenhar(S) {
    var g = S.gestor || { area: 'Comercial', trava: 'produto', meses: '', obs: '' };
    U.view('<section><h1>Três perguntas sobre o seu time</h1></section><section class="card">' + U.cab('Leva um minuto', S.gestor ? U.tag('Respondido', 'ok') : U.tag('Pendente', 'warn')) +
      '<p class="say">Sua resposta entra como evidência no diagnóstico do RH. Ninguém do seu time vê o que você escreveu.</p><div class="form">' +
      '<label>Sua área<select id="g-area">' + U.opts(S.dados ? Object.keys(S.dados.areas) : AREAS, g.area) + '</select></label>' +
      '<label>Principal trava do time<select id="g-trava">' + U.opts(Object.keys(MT.travas).map(function (k) { return [k, MT.travas[k]]; }), g.trava) + '</select></label>' +
      '<label>Meses até uma pessoa nova produzir<input type="number" min="0" id="g-meses" value="' + U.esc(g.meses) + '"></label></div>' +
      '<label>Quer acrescentar algo?<textarea id="g-obs">' + U.esc(g.obs) + '</textarea></label><div class="btns"><button class="btn primary" data-act="enviar">Enviar respostas</button></div></section>');
  }
  U.acoes({ enviar: function () { var g = { area: U.val('g-area'), trava: U.val('g-trava'), meses: U.val('g-meses'), obs: U.val('g-obs') }; st.mudar(function (S) { S.gestor = g; }); } });
  U.topo('Gestor de área', 'Perguntas por link no e-mail');
  st.iniciar(desenhar);
})();
