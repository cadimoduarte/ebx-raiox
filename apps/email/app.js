// Canal de e-mail simulado: a caixa de entrada de cada persona e o envio de arquivos ao Raio-X.
(function () {
  var U = RX.ui, st = RX.store, de = new URLSearchParams(location.search).get('de') || 'ceo', aberta = '', aviso = '';
  if (!RX.NOMES[de]) { de = 'ceo'; }
  function desenhar(S) {
    var lista = S.msgs.filter(function (m) { return m.para === de; }).sort(function (a, b) { return b.ts - a.ts; });
    var m = lista.filter(function (x) { return x.id === aberta; })[0] || lista[0];
    var h = '<section><h1>Caixa de e-mail</h1><p class="muted">Simulação do e-mail de cada persona. No piloto, o Raio-X fala com CEO, BP e gestor por aqui: mensagem curta e um link.</p></section>';
    h += '<div class="tabs">' + Object.keys(RX.NOMES).map(function (k) { var n = S.msgs.filter(function (x) { return x.para === k && !S.lidas[x.id]; }).length; return '<button class="btn" data-act="de" data-v="' + k + '" aria-pressed="' + (k === de) + '">' + RX.NOMES[k] + (n ? ' (' + n + ')' : '') + '</button>'; }).join('') + '</div>';
    if (aviso) { h += '<p class="say" role="status">' + U.esc(aviso) + '</p>'; aviso = ''; }
    h += '<div class="inbox"><div class="list">' + (lista.length ? lista.map(function (x) { return '<button class="mail' + (S.lidas[x.id] ? '' : ' novo') + '" data-act="abrir" data-v="' + x.id + '" aria-current="' + (m && x.id === m.id) + '"><b>' + U.esc(x.assunto) + '</b><span class="sm muted">Raio-X · ' + U.hora(x.ts) + '</span></button>'; }).join('') : '<p class="muted">Nenhuma mensagem para ' + RX.NOMES[de] + ' ainda.</p>') + '</div><div class="list">';
    if (m) { h += '<section class="card"><p class="sm muted">De: Raio-X &lt;raio-x@ebx.example&gt; · Para: ' + RX.NOMES[de] + '</p><h2>' + U.esc(m.assunto) + '</h2><p>' + U.esc(m.corpo) + '</p>' + (m.link ? '<div class="btns"><a class="btn primary" href="' + m.link + '">' + U.esc(m.rotulo) + '</a></div>' : '') + '</section>'; }
    if (de === 'rh' || de === 'bp') {
      h += '<section class="card">' + U.cab('Encaminhar ao Raio-X') + '<p class="sm muted">Para: raio-x@ebx.example. Cole uma transcrição ou anexe a planilha de pessoas. Há exemplos em <a href="/exemplos/transcricao-reuniao.txt">transcricao-reuniao.txt</a> e <a href="/exemplos/base-pessoas.csv">base-pessoas.csv</a>.</p>' +
        '<label>Mensagem<textarea id="corpo" placeholder="Cole aqui a transcrição da reunião"></textarea></label><div class="form"><label>Anexo (CSV)<input type="file" id="anexo" accept=".csv,text/csv"></label></div><div class="btns"><button class="btn primary" data-act="enviar">Enviar</button><button class="btn" data-act="exemplo">Colar a transcrição de exemplo</button></div></section>';
    }
    U.view(h + '</div></div>');
    if (m && !S.lidas[m.id]) { var id = m.id; st.mudar(function (s) { s.lidas[id] = true; }); }
  }
  U.acoes({
    de: function (b) { de = b.getAttribute('data-v'); aberta = ''; history.replaceState(null, '', '?de=' + de); st.redesenhar(); },
    abrir: function (b) { aberta = b.getAttribute('data-v'); st.redesenhar(); },
    exemplo: function () { document.getElementById('corpo').value = RX.dados.transcricao; },
    enviar: function () {
      var txt = U.val('corpo'), anexo = document.getElementById('anexo');
      function gravar(ind) {
        if (!txt && !ind) { aviso = 'Escreva uma mensagem ou anexe um arquivo.'; return st.redesenhar(); }
        aviso = 'Recebido pelo Raio-X: ' + [txt ? 'transcrição lida' : '', ind ? 'planilha com ' + ind.linhas + ' linhas' : ''].filter(Boolean).join(' e ') + '.';
        st.mudar(function (S) { if (txt) { S.transc = (S.transc ? S.transc + '\n\n' : '') + txt; } if (ind) { S.dados = ind; } });
      }
      if (anexo.files[0]) { U.csv(anexo, function (err, ind) { if (err) { aviso = 'Não consegui ler o anexo. ' + err.message; return st.redesenhar(); } gravar(ind); }); } else { gravar(null); }
    }
  });
  U.topo('', 'E-mail simulado');
  st.iniciar(desenhar);
})();
