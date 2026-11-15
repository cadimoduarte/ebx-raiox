// Motor do Raio-X: cruza meta, indicadores, gestor e reuniões com o mapa da METODOLOGIA.
// Aqui são regras e palavras-chave. No produto real, um modelo de linguagem usa o mesmo mapa como ferramenta.
(function () {
  var MT = window.METODOLOGIA;
  function conta(txt, termo) { var n = 0, i = -1; while ((i = txt.indexOf(termo, i + 1)) >= 0) { n++; } return n; }
  function valor(S, t) {
    if (t.ind === 'lider') { return S.lider && S.lider[t.area] != null && S.lider[t.area] !== '' ? +S.lider[t.area] : null; }
    var a = S.dados && S.dados.areas[t.area]; if (!a) { return null; }
    return t.ind === 'turn' ? a.turn : t.ind === 'hx' ? a.hxp : a.senior;
  }
  function fontes(S) { return [!!S.dados, !!S.lider, S.inic.length > 0, !!S.gestor, !!S.transc].filter(Boolean).length; }
  function sinais(txt) {
    var t = String(txt || '').toLowerCase(), achados = {};
    Object.keys(MT.metas).forEach(function (m) { MT.metas[m].alavancas.forEach(function (al) { al.sinais.forEach(function (s) { var n = conta(t, s); if (n) { achados[s] = n; } }); }); });
    return achados;
  }
  function compromissos(txt) {
    return String(txt || '').split(/(?<=[.!?])\s+/).filter(function (f) { return /\b(vai|vamos|ficou de|até)\b/i.test(f); }).slice(0, 3);
  }
  function diag(S) {
    var out = { conf: fontes(S) * 20, causas: [], fazer: [], parar: [], delegar: [], manter: [] };
    if (!S.meta) { return out; }
    var meta = MT.metas[S.meta.tipo], txt = String(S.transc || '').toLowerCase();
    meta.alavancas.forEach(function (al) {
      var pts = 0, ev = [], v = al.teste ? valor(S, al.teste) : null, men = 0, quais = [];
      if (v != null && (al.teste.op === '>' ? v > al.teste.valor : v < al.teste.valor)) {
        pts += 2; ev.push((al.teste.ind === 'lider' ? 'Pesquisa' : 'Base de pessoas') + ': ' + al.teste.area + ' com ' + String(v).replace('.', ',') + (al.teste.ind === 'lider' ? '' : '%') + ' (limite ' + al.teste.valor + ')');
      }
      al.sinais.forEach(function (s) { var n = conta(txt, s); if (n) { men += n; quais.push(s); } });
      if (men) { pts += 1; ev.push('Reuniões: ' + men + (men > 1 ? ' menções a ' : ' menção a ') + quais.join(', ')); }
      if (S.gestor && S.gestor.trava === al.gestor) { pts += 1; ev.push('Gestor de ' + S.gestor.area + ' aponta: ' + MT.travas[al.gestor].toLowerCase()); }
      if (pts) { out.causas.push({ nome: al.nome, causa: al.causa.replace('{v}', v == null ? '' : String(v).replace('.', ',')), pts: pts, ev: ev, fazer: al.fazer }); }
    });
    out.causas.sort(function (a, b) { return b.pts - a.pts; });
    out.causas.slice(0, 2).forEach(function (c) { c.fazer.forEach(function (f) { if (out.fazer.indexOf(f) < 0) { out.fazer.push(f); } }); });
    S.inic.forEach(function (i) {
      var t = i.toLowerCase();
      if (MT.operacional.some(function (k) { return t.indexOf(k) >= 0; })) { out.delegar.push(i); }
      else if (meta.ligadas.some(function (k) { return t.indexOf(k) >= 0; })) { out.manter.push(i); }
      else { out.parar.push(i); }
    });
    return out;
  }
  window.MOTOR = { diag: diag, sinais: sinais, compromissos: compromissos, fontes: fontes };
})();
