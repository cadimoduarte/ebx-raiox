// Tela de entrada. A credencial é conferida no servidor (/api/login); aqui não há e-mail nem senha.
(function () {
  var form = document.getElementById('entrar'), erro = document.getElementById('erro'), botao = document.getElementById('botao');
  function avisar(texto) { erro.textContent = texto; erro.hidden = false; }
  form.addEventListener('submit', function (e) {
    e.preventDefault(); erro.hidden = true; botao.disabled = true;
    var ir = new URLSearchParams(location.search).get('ir') || '';
    fetch('/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: document.getElementById('email').value, senha: document.getElementById('senha').value, ir: ir }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (r) {
        if (r.ok) { location.href = r.j.ir; return; }
        botao.disabled = false; avisar(r.j.erro || 'Não foi possível entrar.'); document.getElementById('senha').select();
      })
      .catch(function () { botao.disabled = false; avisar('Sem conexão com o servidor. Tente de novo.'); });
  });
})();
