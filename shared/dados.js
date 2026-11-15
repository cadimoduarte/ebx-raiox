// Base de pessoas: gerador do exemplo, leitura de CSV e cálculo dos indicadores por área.
(function () {
  var DIA = 86400000;
  function rng(seed) { return function () { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function data(txt) {
    txt = String(txt || '').trim(); if (!txt) { return null; }
    var m = txt.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    var d = m ? new Date(Date.UTC(+m[3], +m[2] - 1, +m[1])) : new Date(txt);
    return isNaN(d) ? null : d;
  }
  // Fábrica fictícia de 200 pessoas: [área, ativos, desligados em 12 meses, hora extra média, parcela com mais de 3 anos]
  function exemplo() {
    var r = rng(7), ref = Date.UTC(2026, 10, 1), linhas = [];
    [['Produção', 130, 23, 24, 0.28], ['Comercial', 24, 9, 4, 0.35], ['Administrativo', 26, 3, 2, 0.5], ['Logística', 20, 4, 10, 0.4]].forEach(function (c) {
      var i, anos;
      for (i = 0; i < c[1]; i++) {
        anos = r() < c[4] ? 3.1 + r() * 8 : 0.1 + r() * 2.8;
        linhas.push({ area: c[0], adm: iso(new Date(ref - anos * 365 * DIA)), desl: '', hx: Math.round(c[3] * (0.5 + r())) });
      }
      for (i = 0; i < c[2]; i++) {
        linhas.push({ area: c[0], adm: iso(new Date(ref - (0.3 + r() * 2) * 365 * DIA)), desl: iso(new Date(ref - r() * 350 * DIA)), hx: 0 });
      }
    });
    return linhas;
  }
  function csv(texto) {
    var ls = texto.split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (ls.length < 2) { throw new Error('O arquivo precisa de um cabeçalho e ao menos uma linha.'); }
    var sep = ls[0].indexOf(';') >= 0 ? ';' : ',';
    var cab = ls[0].toLowerCase().split(sep).map(function (c) { return c.trim().replace(/^"|"$/g, ''); });
    var ia = cab.indexOf('area'), id = cab.indexOf('admissao'), ie = cab.indexOf('desligamento'), ih = cab.indexOf('horas_extras');
    if (ia < 0) { ia = cab.indexOf('área'); }
    if (ia < 0 || id < 0) { throw new Error('Faltam as colunas area e admissao no cabeçalho.'); }
    return ls.slice(1).map(function (l) {
      var c = l.split(sep).map(function (x) { return x.trim().replace(/^"|"$/g, ''); });
      return { area: c[ia] || 'Sem área', adm: c[id], desl: ie >= 0 ? c[ie] : '', hx: ih >= 0 ? parseFloat(String(c[ih]).replace(',', '.')) || 0 : 0 };
    });
  }
  function indicadores(linhas, fonte) {
    var ref = 0, areas = {}, total = 0;
    linhas.forEach(function (l) { [data(l.adm), data(l.desl)].forEach(function (d) { if (d && d.getTime() > ref) { ref = d.getTime(); } }); });
    linhas.forEach(function (l) {
      var a = areas[l.area] || (areas[l.area] = { ativos: 0, desl: 0, hx: 0, sen: 0 });
      var adm = data(l.adm), desl = data(l.desl);
      if (desl) { if (ref - desl.getTime() <= 365 * DIA) { a.desl++; } return; }
      a.ativos++; total++; a.hx += l.hx || 0;
      if (adm && ref - adm.getTime() >= 3 * 365 * DIA) { a.sen++; }
    });
    Object.keys(areas).forEach(function (k) {
      var a = areas[k], n = a.ativos || 1;
      a.turn = Math.round(a.desl / n * 1000) / 10;
      a.hxp = Math.round(a.hx / (n * 220) * 1000) / 10;
      a.senior = Math.round(a.sen / n * 100);
    });
    return { fonte: fonte, linhas: linhas.length, ativos: total, areas: areas };
  }
  window.RX = window.RX || {};
  window.RX.dados = window.DADOS = {
    exemplo: exemplo, csv: csv, indicadores: indicadores,
    transcricao: 'Reunião comercial de terça. O gestor disse que vendedor novo demora quatro meses para fechar a primeira venda porque não conhece o produto. Pediram treinamento de produto antes de ir a campo. Dois supervisores reclamaram que não têm tempo para acompanhamento. O RH vai apresentar uma proposta de onboarding até sexta. Também falaram do roadshow de cultura, que ocupa a agenda de todos em novembro.',
    iniciativas: ['Roadshow de cultura em 6 unidades', 'Onboarding comercial', 'Nova pesquisa de clima', 'Triagem manual de currículos', 'Relatório mensal de absenteísmo', 'Festa de fim de ano']
  };
})();
