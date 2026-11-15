// Peças de interface usadas por todas as aplicações.
window.RX = window.RX || {};
(function () {
  var MT = RX.METODOLOGIA, MOTOR = RX.motor;
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  function num(n) { return String(n).replace('.', ','); }
  function li(a) { return a.length ? '<ul>' + a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '<p class="muted sm">Nada aqui por enquanto.</p>'; }
  function opts(lista, atual) { return lista.map(function (o) { var v = Array.isArray(o) ? o[0] : o, r = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(v) + '"' + (String(v) === String(atual) ? ' selected' : '') + '>' + esc(r) + '</option>'; }).join(''); }
  function tag(txt, tipo) { return '<span class="tag ' + (tipo || '') + '">' + esc(txt) + '</span>'; }
  function cab(titulo, estado) { return '<div class="head"><h2>' + esc(titulo) + '</h2>' + (estado || '') + '</div>'; }
  function trava(titulo, txt) { return '<section class="card lock">' + cab(titulo, tag('Aguardando', 'warn')) + '<p class="muted">' + esc(txt) + '</p></section>'; }
  function metaTxt(S) { return S.meta ? MT.metas[S.meta.tipo].nome + (S.meta.alvo ? ' · alvo ' + S.meta.alvo : '') + ' · ' + S.meta.prazo : ''; }
  function topo(persona, canal) {
    document.getElementById('topo').innerHTML = '<header class="top"><div class="top-in"><a class="brand" href="/hub/"><span class="logo">EBX</span><span>Raio-X</span></a>' +
      '<span class="who">' + (persona ? esc(persona) + ' · ' : '') + esc(canal) + '</span><span style="flex:1"></span><nav><a href="/hub/">Painel da demo</a></nav></div></header>';
  }
  function diag(S, d) {
    if (!d.causas.length) { return '<p class="say">Com os dados enviados, nenhuma alavanca do mapa passou do limite para a meta escolhida. Envie mais fontes ou revise os limites no mapa EBX.</p>'; }
    var h = '<p class="sm muted">Confiança: ' + d.conf + '% · ' + MOTOR.fontes(S) + ' de 5 fontes</p><div class="meter"><i style="width:' + d.conf + '%"></i></div>';
    d.causas.forEach(function (c, i) { h += '<div class="box"><div class="head"><h3>' + (i + 1) + '. ' + esc(c.nome) + '</h3>' + tag(c.pts + (c.pts > 1 ? ' evidências' : ' evidência'), c.pts >= 3 ? 'ok' : 'warn') + '</div><p>' + esc(c.causa) + '</p>' + li(c.ev) + '</div>'; });
    return h;
  }
  function plano(d) { return '<div class="cols3"><div class="box do"><h3>Fazer</h3>' + li(d.fazer) + '</div><div class="box stop"><h3>Parar ou adiar</h3>' + li(d.parar) + '</div><div class="box auto"><h3>Delegar ou automatizar</h3>' + li(d.delegar) + '</div><div class="box keep"><h3>Manter</h3>' + li(d.manter) + '</div></div>'; }
  function fases(S) {
    var feito = S.sem.length > 0;
    return [
      { n: 'Metas', quem: 'CEO', ok: !!S.meta, href: '/email/?de=ceo', falta: 'O CEO abre o e-mail e responde a entrevista' },
      { n: 'Dados', quem: MOTOR.fontes(S) + ' de 5 fontes', ok: !!S.dados, href: '/email/?de=rh', falta: 'O líder de RH envia a base de pessoas pelo portal' },
      { n: 'Raio-X', quem: 'Motor e EBX', ok: S.rev.st === 'aprovado', href: '/console/', falta: 'A EBX revisa o diagnóstico no console' },
      { n: 'Plano e rotina', quem: 'RH e BP', ok: S.plano.ok && feito, href: S.plano.ok ? '/email/?de=bp' : '/portal/#plano', falta: S.plano.ok ? 'O BP faz o check-in da semana' : 'O líder de RH aprova o plano' },
      { n: 'Resultado', quem: 'CEO', ok: !!S.dec, href: S.mes ? '/email/?de=ceo' : '/hub/', falta: S.mes ? 'O CEO lê o relatório e decide' : 'Feche o mês no painel para enviar o relatório' }
    ];
  }
  function trilho(S) {
    var achou = false;
    return '<div class="steps">' + fases(S).map(function (x, i) { var agora = !x.ok && !achou; if (agora) { achou = true; } return '<a class="step' + (x.ok ? ' ok' : agora ? ' now' : '') + '" href="' + x.href + '"><b>' + (i + 1) + '. ' + x.n + '</b><small>' + esc(x.quem) + '</small><small>' + (x.ok ? 'Concluída' : agora ? 'Agora' : 'A seguir') + '</small></a>'; }).join('') + '</div>';
  }
  function acoes(mapa) {
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-act]') : null;
      if (b && !b.disabled && mapa[b.getAttribute('data-act')]) { mapa[b.getAttribute('data-act')](b); }
    });
  }
  function csv(input, feito) {
    var arq = input.files[0], r = new FileReader();
    r.onload = function () { try { feito(null, RX.dados.indicadores(RX.dados.csv(String(r.result)), arq.name)); } catch (err) { feito(err); } };
    r.readAsText(arq);
  }
  function hora(ts) { var d = new Date(ts); return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }
  RX.ui = { esc: esc, val: val, num: num, li: li, opts: opts, tag: tag, cab: cab, trava: trava, metaTxt: metaTxt, topo: topo, diag: diag, plano: plano, fases: fases, trilho: trilho, acoes: acoes, csv: csv, hora: hora, view: function (h) { document.getElementById('view').innerHTML = h; } };
})();
