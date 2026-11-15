// Canal do líder de RH: portal web com quatro abas (dados, raio-X, plano e time).
(function () {
  var U = RX.ui, st = RX.store, AREAS = ['Produção', 'Comercial', 'Administrativo', 'Logística'], aviso = '';
  var ABAS = [['dados', 'Dados'], ['raiox', 'Raio-X'], ['plano', 'Plano'], ['time', 'Time']];
  function aba() { var h = location.hash.slice(1); return ABAS.some(function (a) { return a[0] === h; }) ? h : 'dados'; }
  function tDados(S) {
    var h = '<section class="card">' + U.cab('Base de pessoas', S.dados ? U.tag(S.dados.fonte, 'ok') : U.tag('Pendente', 'warn')) +
      '<p>Envie um CSV com as colunas <code>area;admissao;desligamento;horas_extras</code>. O Raio-X calcula o que faltar. Há um arquivo de teste em <a href="/exemplos/base-pessoas.csv">exemplos/base-pessoas.csv</a>.</p>' +
      '<div class="form"><label>Arquivo CSV<input type="file" id="csv" accept=".csv,text/csv"></label></div><div class="btns"><button class="btn" data-act="base">Usar a base de exemplo (fábrica de 200 pessoas)</button></div>';
    if (S.dados) {
      h += '<div class="scroll"><table><thead><tr><th>Área</th><th class="num">Ativos</th><th class="num">Turnover 12 meses</th><th class="num">Hora extra</th><th class="num">Mais de 3 anos</th></tr></thead><tbody>' +
        Object.keys(S.dados.areas).map(function (k) { var a = S.dados.areas[k]; return '<tr><td>' + U.esc(k) + '</td><td class="num">' + a.ativos + '</td><td class="num">' + U.num(a.turn) + '%</td><td class="num">' + U.num(a.hxp) + '%</td><td class="num">' + a.senior + '%</td></tr>'; }).join('') +
        '</tbody></table></div><p class="sm muted">' + S.dados.linhas + ' linhas lidas. Hora extra em relação a 220 horas mensais por pessoa.</p>';
    }
    h += '</section>';
    var ar = S.dados ? Object.keys(S.dados.areas) : AREAS, L = S.lider || {};
    h += '<section class="card">' + U.cab('Pesquisa: nota da liderança por área', S.lider ? U.tag('Enviada', 'ok') : U.tag('Opcional')) + '<div class="form">' +
      ar.map(function (a, i) { return '<label>' + U.esc(a) + ' (0 a 10)<input type="number" min="0" max="10" step="0.1" id="l-' + i + '" data-area="' + U.esc(a) + '" value="' + U.esc(L[a] == null ? '' : L[a]) + '"></label>'; }).join('') +
      '</div><div class="btns"><button class="btn primary" data-act="lider">Salvar notas</button><button class="btn" data-act="liderEx">Usar exemplo</button></div></section>';
    h += '<section class="card">' + U.cab('Iniciativas atuais do RH', S.inic.length ? U.tag(S.inic.length + ' listadas', 'ok') : U.tag('Opcional')) +
      '<label>Uma por linha<textarea id="inic" placeholder="ex.: Roadshow de cultura">' + U.esc(S.inic.join('\n')) + '</textarea></label><div class="btns"><button class="btn primary" data-act="inic">Salvar iniciativas</button><button class="btn" data-act="inicEx">Usar exemplo</button></div></section>';
    return h;
  }
  function tRaiox(S) {
    if (!S.meta) { return U.trava('Raio-X', 'Falta a entrevista do CEO. Sem a meta do negócio, não há o que priorizar.'); }
    if (!RX.motor.fontes(S)) { return U.trava('Raio-X', 'Envie ao menos uma fonte na aba Dados.'); }
    var ok = S.rev.st === 'aprovado';
    return '<section class="card agent">' + U.cab('Meta: ' + U.metaTxt(S), ok ? U.tag('Revisado pela EBX', 'ok') : U.tag('Revisão EBX ' + S.rev.st, 'warn')) + (ok ? '' : '<p class="muted">Este é o rascunho do motor. A versão final chega depois da revisão da EBX.</p>') + U.diag(S, RX.motor.diag(S)) + (S.rev.nota ? '<p class="say"><b>Nota da EBX:</b> ' + U.esc(S.rev.nota) + '</p>' : '') + '</section>';
  }
  function tPlano(S) {
    if (!S.meta || !RX.motor.fontes(S)) { return U.trava('Plano de prioridades', 'O plano nasce do raio-X. Faltam a meta do CEO e os dados.'); }
    var d = RX.motor.diag(S), ok = S.rev.st === 'aprovado';
    return '<section class="card">' + U.cab('Plano de prioridades', S.plano.ok ? U.tag('Aprovado', 'ok') : U.tag('Rascunho', 'warn')) + U.plano(d) +
      (S.dec ? '<p class="say"><b>Decisão do CEO:</b> ' + U.esc(S.dec) + (d.parar[0] ? ' (' + U.esc(d.parar[0]) + ')' : '') + '.</p>' : '') +
      (ok ? '' : '<p class="muted sm">Você pode aprovar depois que a EBX revisar o diagnóstico.</p>') +
      '<div class="btns"><button class="btn primary" data-act="plano"' + (ok && d.fazer.length ? '' : ' disabled') + '>' + (S.plano.ok ? 'Reabrir plano' : 'Aprovar plano') + '</button></div></section>';
  }
  function tTime(S) {
    if (!S.plano.ok) { return U.trava('Time', 'O acompanhamento começa depois que o plano for aprovado.'); }
    var d = RX.motor.diag(S), h = '<section class="card">' + U.cab('Andamento das prioridades') + '<div class="scroll"><table><thead><tr><th>Ação</th><th>Situação</th></tr></thead><tbody>' + d.fazer.map(function (a) { var s = S.plano.st[a] || 'Não iniciada'; return '<tr><td>' + U.esc(a) + '</td><td>' + U.tag(s, s === 'Concluída' ? 'ok' : s === 'Em andamento' ? 'warn' : '') + '</td></tr>'; }).join('') + '</tbody></table></div></section>';
    h += '<section class="card">' + U.cab('Tempo do BP nas prioridades', U.tag('Semana ' + S.semana));
    h += S.sem.length ? '<div class="scroll"><table><thead><tr><th>Semana</th><th class="num">Prioridades</th><th class="num">Outras</th><th class="num">Foco</th></tr></thead><tbody>' + S.sem.map(function (w) { var p = RX.foco(w); return '<tr><td>' + w.n + '</td><td class="num">' + w.hp + ' h</td><td class="num">' + w.ho + ' h</td><td class="num">' + (p < 50 ? U.tag(p + '%', 'crit') : p + '%') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="muted">Nenhum check-in registrado ainda.</p>';
    return h + '</section>';
  }
  function desenhar(S) {
    var a = aba(), h = '<section><h1>Portal do RH</h1><p class="muted">' + (S.meta ? 'Meta do negócio: ' + U.esc(U.metaTxt(S)) : 'Aguardando a entrevista do CEO.') + '</p></section>';
    h += '<div class="tabs">' + ABAS.map(function (x) { return '<a class="btn" href="#' + x[0] + '" aria-pressed="' + (x[0] === a) + '">' + x[1] + '</a>'; }).join('') + '</div>';
    if (aviso) { h += '<p class="say" role="status">' + U.esc(aviso) + '</p>'; aviso = ''; }
    U.view(h + { dados: tDados, raiox: tRaiox, plano: tPlano, time: tTime }[a](S));
  }
  function salvar(msg, fn) { aviso = msg; st.mudar(fn); }
  U.acoes({
    base: function () { salvar('Base de exemplo carregada.', function (S) { S.dados = RX.dados.indicadores(RX.dados.exemplo(), 'Base de exemplo'); }); },
    lider: function () { var o = {}, n = 0; document.querySelectorAll('[data-area]').forEach(function (e) { if (e.value !== '') { o[e.getAttribute('data-area')] = +e.value; n++; } }); salvar('Notas salvas.', function (S) { S.lider = n ? o : null; }); },
    liderEx: function () { salvar('Notas de exemplo carregadas.', function (S) { S.lider = { 'Produção': 6.4, 'Comercial': 5.1, 'Administrativo': 7.2, 'Logística': 6.8 }; }); },
    inic: function () { var l = U.val('inic').split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean); salvar('Iniciativas salvas.', function (S) { S.inic = l; }); },
    inicEx: function () { salvar('Iniciativas de exemplo carregadas.', function (S) { S.inic = RX.dados.iniciativas.slice(); }); },
    plano: function () { salvar('', function (S) { S.plano.ok = !S.plano.ok; if (S.plano.ok && S.semana < 1) { S.semana = 1; } aviso = S.plano.ok ? 'Plano aprovado. O BP recebeu o check-in da semana 1.' : 'Plano reaberto.'; }); }
  });
  document.addEventListener('change', function (e) {
    if (e.target.id !== 'csv' || !e.target.files[0]) { return; }
    U.csv(e.target, function (err, ind) { if (err) { aviso = 'Não consegui ler o arquivo. ' + err.message; return st.redesenhar(); } salvar('Arquivo lido e indicadores calculados.', function (S) { S.dados = ind; }); });
  });
  window.addEventListener('hashchange', function () { st.redesenhar(); });
  U.topo('Líder de RH', 'Portal web');
  st.iniciar(desenhar);
})();
