// Estado único da demo, guardado no servidor local e sincronizado entre todas as telas abertas.
window.RX = window.RX || {};
(function () {
  var VAZIO = { meta: null, dados: null, lider: null, inic: [], gestor: null, transc: '', rev: { st: 'pendente', nota: '' }, plano: { ok: false, st: {} }, sem: [], semana: 0, mes: 0, dec: '', msgs: [], lidas: {} };
  var S = null, rev = -1, cb = null, pendente = false;
  function novo() { return JSON.parse(JSON.stringify(VAZIO)); }
  function digitando() { var a = document.activeElement; return !!a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.type !== 'file'; }
  function mostrar() { pendente = false; if (cb) { cb(S); } }
  // Sessão vencida (ou servidor reiniciado): volta ao login e retorna para esta tela depois.
  async function pedir(url, opc) {
    var r = await fetch(url, opc);
    if (r.status === 401) { location.href = '/login/?ir=' + encodeURIComponent(location.pathname + location.search); throw new Error('sem sessão'); }
    return r.json();
  }
  async function ler() {
    var j = await pedir('/api/state');
    rev = j.rev; S = Object.assign(novo(), j.dados || {}); RX.fluxo(S); return S;
  }
  async function mudar(fn) {
    await ler(); fn(S); RX.fluxo(S);
    var j = await pedir('/api/state', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ dados: S }) });
    rev = j.rev; mostrar();
  }
  async function iniciar(desenhar) {
    cb = desenhar; await ler(); mostrar();
    var es = new EventSource('/api/events');
    es.onmessage = async function (e) {
      if (+e.data <= rev) { return; }
      await ler();
      if (digitando()) { pendente = true; } else { mostrar(); }
    };
    document.addEventListener('focusout', function () { setTimeout(function () { if (pendente && !digitando()) { mostrar(); } }, 250); });
  }
  RX.store = {
    iniciar: iniciar, mudar: mudar, redesenhar: mostrar, get: function () { return S; },
    zerar: function () { return mudar(function (s) { Object.keys(s).forEach(function (k) { delete s[k]; }); Object.assign(s, novo()); }); }
  };
})();
