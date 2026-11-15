// Mapa EBX: meta do negócio -> alavanca de pessoas -> indicador -> ação.
// Conteúdo PROVISÓRIO, no mesmo padrão do src/mcp/metodologia.js do ERP:
// Kelly e Larissa trocam textos, limites e ações aqui, sem mexer na lógica (js/motor.js).
window.METODOLOGIA = {
  provisoria: true,
  // Tarefas que o motor sugere delegar ou automatizar
  operacional: ['triagem', 'holerite', 'relatório', 'relatorio', 'ponto', 'agendamento', 'conferência', 'conferencia', 'planilha'],
  travas: {
    produto: 'Não conhecem o produto',
    acompanhamento: 'Falta acompanhamento do líder',
    escala: 'Escala e hora extra',
    contratacao: 'Demora para contratar',
    remuneracao: 'Remuneração ou comissão'
  },
  metas: {
    receita: {
      nome: 'Crescer receita',
      ligadas: ['comercial', 'venda', 'vendedor', 'onboarding', 'produto', 'comissão', 'supervisor'],
      alavancas: [
        { id: 'ramp', nome: 'Vendedor novo demora a produzir', teste: { ind: 'turn', area: 'Comercial', op: '>', valor: 25 },
          causa: 'O comercial perde {v}% do time por ano: o vendedor sai antes de dar retorno.',
          sinais: ['produto', 'treinamento', 'primeira venda'], gestor: 'produto',
          fazer: ['Onboarding comercial de 30 dias', 'Trilha de produto para vendedores novos'] },
        { id: 'lidvendas', nome: 'Supervisão comercial sem preparo', teste: { ind: 'lider', area: 'Comercial', op: '<', valor: 6 },
          causa: 'A liderança comercial tem nota {v} na pesquisa: falta acompanhamento do time.',
          sinais: ['acompanhamento', 'supervisor', 'liderança'], gestor: 'acompanhamento',
          fazer: ['Preparar os supervisores de vendas', 'Ritual semanal de acompanhamento'] },
        { id: 'remun', nome: 'Comissão desalinhada com a meta', teste: null,
          causa: 'A regra de comissão aparece como queixa recorrente.',
          sinais: ['comissão', 'salário', 'remuneração'], gestor: 'remuneracao',
          fazer: ['Revisar a regra de comissão com a diretoria comercial'] }
      ]
    },
    margem: {
      nome: 'Melhorar a margem',
      ligadas: ['escala', 'hora extra', 'turno', 'encarregado', 'produção', 'retenção', 'custo'],
      alavancas: [
        { id: 'hx', nome: 'Hora extra concentrada na produção', teste: { ind: 'hx', area: 'Produção', op: '>', valor: 8 },
          causa: 'A hora extra equivale a {v}% das horas da produção.',
          sinais: ['hora extra', 'escala', 'turno'], gestor: 'escala',
          fazer: ['Redesenhar a escala dos turnos', 'Formar encarregados em gestão de escala'] },
        { id: 'repos', nome: 'Custo de reposição na produção', teste: { ind: 'turn', area: 'Produção', op: '>', valor: 15 },
          causa: 'A produção troca {v}% do time por ano, e cada troca custa recrutamento e treino.',
          sinais: ['saída', 'pedido de demissão', 'reposição'], gestor: 'contratacao',
          fazer: ['Plano de retenção para operadores', 'Entrevista de permanência nas áreas críticas'] },
        { id: 'lidprod', nome: 'Encarregados sem preparo', teste: { ind: 'lider', area: 'Produção', op: '<', valor: 6 },
          causa: 'A liderança da produção tem nota {v} na pesquisa.',
          sinais: ['encarregado', 'liderança'], gestor: 'acompanhamento',
          fazer: ['Desenvolver os encarregados da produção'] }
      ]
    },
    expansao: {
      nome: 'Abrir nova unidade',
      ligadas: ['transferência', 'contratação', 'escola', 'multiplicador', 'nova unidade', 'talento', 'vaga'],
      alavancas: [
        { id: 'senior', nome: 'Pouca gente experiente para formar a nova equipe', teste: { ind: 'senior', area: 'Produção', op: '<', valor: 30 },
          causa: 'Só {v}% da produção tem mais de 3 anos de casa.',
          sinais: ['experiência', 'formar', 'multiplicador'], gestor: 'produto',
          fazer: ['Mapear quem aceita transferência', 'Programa de multiplicadores internos'] },
        { id: 'contrat', nome: 'Contratação lenta para a nova região', teste: null,
          causa: 'A contratação aparece como principal trava para abrir a unidade.',
          sinais: ['contratação', 'vaga', 'mão de obra'], gestor: 'contratacao',
          fazer: ['Parceria com escola técnica da região', 'Abrir banco de talentos local'] },
        { id: 'repos2', nome: 'Rotatividade drena a operação atual', teste: { ind: 'turn', area: 'Produção', op: '>', valor: 15 },
          causa: 'A produção atual já troca {v}% do time por ano.',
          sinais: ['saída', 'reposição'], gestor: 'escala',
          fazer: ['Plano de retenção antes da expansão'] }
      ]
    }
  }
};
