// Canal da EBX: console de revisão dos diagnósticos e o mapa que o motor aplica.
(function () {
  var U = RX.ui, st = RX.store, MT = RX.METODOLOGIA;
  function desenhar(S) {
    var h = '<section><h1>Console de revisão</h1><p class="muted">Nenhum diagnóstico chega ao cliente sem passar por aqui.</p></section>';
    if (!S.meta || !RX.motor.fontes(S)) { h += U.trava('Fila vazia', 'Faltam a meta do CEO e ao menos uma fonte de dados do RH.'); }
    else {
      var d = RX.motor.diag(S);
      h += '<section class="card agent">' + U.cab('Chocalhos Brasil: diagnóstico', U.tag(S.rev.st, S.rev.st === 'aprovado' ? 'ok' : 'warn')) + '<p><b>Meta do cliente:</b> ' + U.esc(U.metaTxt(S)) + '</p>' + U.diag(S, d) + U.plano(d) +
        '<label>Nota para o RH do cliente<textarea id="nota" placeholder="ex.: antes do onboarding, alinhe o perfil de contratação com o gestor">' + U.esc(S.rev.nota) + '</textarea></label>' +
        '<div class="btns"><button class="btn primary" data-act="rev" data-v="aprovado">Aprovar e liberar</button><button class="btn" data-act="rev" data-v="em ajuste">Pedir ajuste</button></div></section>';
    }
    h += '<section class="card"><div class="head"><h2>Mapa EBX: meta, alavanca, indicador e ação</h2>' + (MT.provisoria ? U.tag('Conteúdo provisório', 'warn') : '') + '</div><p class="muted">É este mapa que o motor aplica. Ele fica em um arquivo só (<code>shared/metodologia.js</code>), para a EBX trocar textos, limites e ações sem mexer na lógica.</p><div class="scroll"><table><thead><tr><th>Meta</th><th>Alavanca</th><th>Dispara quando</th><th>Ações</th></tr></thead><tbody>';
    var nomes = { turn: 'Turnover', hx: 'Hora extra', senior: 'Mais de 3 anos de casa', lider: 'Nota da liderança' };
    Object.keys(MT.metas).forEach(function (m) { MT.metas[m].alavancas.forEach(function (a) { var t = a.teste; h += '<tr><td>' + U.esc(MT.metas[m].nome) + '</td><td>' + U.esc(a.nome) + '</td><td>' + (t ? U.esc(nomes[t.ind] + ' em ' + t.area + (t.op === '>' ? ' acima de ' : ' abaixo de ') + t.valor) : 'Gestor ou reuniões citam o tema') + '</td><td>' + U.esc(a.fazer.join('; ')) + '</td></tr>'; }); });
    U.view(h + '</tbody></table></div></section>');
  }
  U.acoes({ rev: function (b) { var v = b.getAttribute('data-v'), nota = U.val('nota'); st.mudar(function (S) { S.rev = { st: v, nota: nota }; if (v !== 'aprovado') { S.plano.ok = false; } }); } });
  U.topo('Consultora EBX', 'Console de revisão');
  st.iniciar(desenhar);
})();
