// Fluxo entre canais: a partir do estado, garante que cada persona recebeu as mensagens devidas.
// Cada mensagem tem um id fixo, então rodar de novo não duplica nada.
window.RX = window.RX || {};
(function () {
  var NOMES = { ceo: 'CEO', rh: 'Líder de RH', bp: 'BP de RH', gestor: 'Gestor de área', ebx: 'Consultora EBX' };
  function foco(w) { var t = w.hp + w.ho; return t ? Math.round(w.hp / t * 100) : 0; }
  function add(S, id, para, assunto, corpo, link, rotulo) {
    if (S.msgs.some(function (m) { return m.id === id; })) { return; }
    S.msgs.push({ id: id, para: para, assunto: assunto, corpo: corpo, link: link || '', rotulo: rotulo || '', ts: Date.now() });
  }
  function fluxo(S) {
    add(S, 'convite', 'ceo', 'Entrevista de metas do trimestre', 'São cinco perguntas, cerca de 5 minutos. Suas respostas orientam as prioridades do RH neste trimestre.', '/entrevista/', 'Responder a entrevista');
    if (S.meta) {
      add(S, 'dados', 'rh', 'A meta do negócio chegou: envie os dados', 'O CEO respondeu a entrevista. Envie a base de pessoas, a pesquisa e as iniciativas atuais. O que faltar, o Raio-X calcula.', '/portal/#dados', 'Abrir o portal');
      add(S, 'perguntas', 'gestor', 'Três perguntas sobre o seu time', 'Leva um minuto. Sua resposta entra como evidência no diagnóstico do RH.', '/gestor/', 'Responder');
      add(S, 'transcricoes', 'bp', 'Encaminhe as transcrições das reuniões', 'Sempre que uma reunião com gestores tiver transcrição, encaminhe para raio-x@ebx.example. Não precisa formatar.', '/email/?de=bp', 'Encaminhar agora');
    }
    if (S.meta && RX.motor.fontes(S) > 0) { add(S, 'fila', 'ebx', 'Diagnóstico aguardando revisão', 'Há um diagnóstico novo na fila. Ele só chega ao cliente depois da sua revisão.', '/console/', 'Abrir o console'); }
    if (S.rev.st === 'aprovado') { add(S, 'liberado', 'rh', 'O raio-X foi revisado pela EBX', 'O diagnóstico está liberado. Veja as causas, ajuste e aprove o plano de prioridades.', '/portal/#raiox', 'Ver o raio-X'); }
    if (S.plano.ok) {
      for (var k = 1; k <= S.semana; k++) { add(S, 'checkin-' + k, 'bp', 'Check-in da semana ' + k, 'Três perguntas, dois minutos: como andam as prioridades e para onde foram as suas horas.', '/checkin/?semana=' + k, 'Fazer o check-in'); }
      for (var m = 1; m <= S.mes; m++) { add(S, 'relatorio-' + m, 'ceo', 'Relatório mensal do RH: mês ' + m, 'O que o RH priorizou para a sua meta, o que avançou e uma decisão que depende de você.', '/relatorio/', 'Abrir o relatório'); }
    }
    S.sem.forEach(function (w) {
      var p = foco(w);
      add(S, 'resumo-' + w.n, 'rh', 'Resumo da semana ' + w.n + ': ' + p + '% do tempo nas prioridades', 'O BP registrou ' + w.hp + ' horas nas prioridades e ' + w.ho + ' em outras atividades.', '/portal/#time', 'Ver o time');
      if (p < 50) { add(S, 'alerta-' + w.n, 'bp', 'Alerta: ' + (100 - p) + '% do seu tempo ficou fora do plano', 'Na semana ' + w.n + ', a maior parte das suas horas foi para atividades sem vínculo com a meta. Vale rever com a liderança de RH.', '', ''); }
    });
    if (S.dec) { add(S, 'decisao', 'rh', 'O CEO respondeu ao relatório: ' + S.dec, 'A decisão do CEO já está registrada no plano.', '/portal/#plano', 'Ver o plano'); }
    return S;
  }
  RX.fluxo = fluxo; RX.NOMES = NOMES; RX.foco = foco;
})();
