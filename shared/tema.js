// Tema claro ou escuro. Carregado no <head> para aplicar a escolha antes de a tela aparecer.
// A escolha é preferência de quem vê: fica no navegador (localStorage), fora do estado compartilhado.
window.RX = window.RX || {};
(function () {
  var CHAVE = 'rx-tema', raiz = document.documentElement;
  function valido(t) { return t === 'dark' || t === 'light'; }
  function salvo() { try { return window.localStorage.getItem(CHAVE); } catch (e) { return null; } }
  function atual() {
    var t = raiz && raiz.getAttribute('data-theme');
    if (valido(t)) { return t; }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function aplicar(t) { if (raiz && valido(t)) { raiz.setAttribute('data-theme', t); } }
  function alternar() {
    var t = atual() === 'dark' ? 'light' : 'dark';
    aplicar(t);
    try { window.localStorage.setItem(CHAVE, t); } catch (e) { /* sem armazenamento: vale só nesta tela */ }
    return t;
  }
  aplicar(salvo());
  RX.tema = { CHAVE: CHAVE, atual: atual, aplicar: aplicar, alternar: alternar };
})();
