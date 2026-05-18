/**
 * questions.js — 27 questões do Diagnóstico de IA
 * Perfil de Uso (Q1): escala progressiva de comportamento
 * Conhecimento (Q2-Q27): questões objetivas com resposta correta
 */

export const QUESTIONS = [
  // ── Perfil de Uso (Q1) ───────────────────────────────────
  {
    id: 1,
    dimension: 'perfil_uso',
    text: 'Com que frequência você utiliza IA no trabalho?',
    options: {
      A: 'Nunca utilizei.',
      B: 'Utilizo raramente (ocasionalmente).',
      C: 'Utilizo semanalmente.',
      D: 'Utilizo diariamente (todos os dias ou várias vezes ao dia).',
    },
  },

  // ── Fundamentos de IA (Q2-Q3) ────────────────────────────
  {
    id: 2,
    dimension: 'fundamentos_ia',
    text: 'Qual cenário melhor representa a evolução de automações tradicionais para soluções baseadas em IA?',
    options: {
      A: 'Substituição integral de automações existentes por IA.',
      B: 'Sistemas orientados a dados que ajustam comportamento conforme contexto e padrões.',
      C: 'Combinação de automação tradicional com modelos baseados em dados.',
      D: 'Uso de IA apenas em tarefas onde regras fixas não funcionam bem.',
    },
  },
  {
    id: 3,
    dimension: 'fundamentos_ia',
    text: 'Qual abordagem representa adoção mais sustentável de IA?',
    options: {
      A: 'Iniciar múltiplos projetos simultaneamente para acelerar maturidade.',
      B: 'Permitir que cada área implemente IA conforme necessidade local.',
      C: 'Evoluir iniciativas priorizadas com alinhamento estratégico e governança.',
      D: 'Centralizar toda iniciativa em TI para manter padronização.',
    },
  },

  // ── IA Generativa (Q4-Q6) ────────────────────────────────
  {
    id: 4,
    dimension: 'ia_generativa',
    text: 'Qual papel representa melhor o uso corporativo maduro de IA generativa?',
    options: {
      A: 'Ferramenta de produtividade para atividades administrativas.',
      B: 'Uso em fluxos específicos com revisão humana estruturada.',
      C: 'Integração em processos operacionais e analíticos com governança definida.',
      D: 'Apoio à criação rápida de conteúdo e documentação.',
    },
  },
  {
    id: 5,
    dimension: 'ia_generativa',
    text: 'Como modelos de linguagem funcionam principalmente?',
    options: {
      A: 'Recuperam respostas de bases de conhecimento pré-definidas.',
      B: 'Aplicam regras linguísticas programadas previamente.',
      C: 'Predizem respostas com base em contexto e padrões aprendidos.',
      D: 'Combinam padrões estatísticos com grandes volumes de dados.',
    },
  },
  {
    id: 6,
    dimension: 'ia_generativa',
    text: 'Uma organização quer usar IA generativa em processos internos. Qual abordagem tende a reduzir risco sem limitar valor?',
    options: {
      A: 'Integrar IA em fluxos com validação, monitoramento e critérios definidos.',
      B: 'Permitir uso apenas em tarefas não críticas.',
      C: 'Restringir IA apenas a áreas criativas.',
      D: 'Liberar uso amplo para acelerar adoção organizacional.',
    },
  },

  // ── Uso Prático (Q7-Q8) ──────────────────────────────────
  {
    id: 7,
    dimension: 'uso_pratico',
    text: 'Qual abordagem tende a gerar melhores resultados ao interagir com IA?',
    options: {
      A: 'Fazer perguntas e obter respostas repetidamente, melhorando a pergunta até chegar à resposta desejada.',
      B: 'Estruturar a pergunta com objetivo, contexto, restrições e formato esperado.',
      C: 'Fazer perguntas rápidas e simples para ganhar velocidade.',
      D: 'Fornecer algum contexto parcial conforme necessidade.',
    },
  },
  {
    id: 8,
    dimension: 'uso_pratico',
    text: 'Uma equipe recebe respostas inconsistentes da IA. Qual ação tende a melhorar a qualidade dos resultados?',
    options: {
      A: 'Aprimorar o contexto fornecido, explicitar critérios de sucesso e adicionar restrições operacionais claras na solicitação.',
      B: 'Padronizar os prompts em um único template, independentemente do tipo de tarefa ou objetivo.',
      C: 'Repetir a mesma solicitação múltiplas vezes, assumindo que a variabilidade estatística do modelo converge para a resposta ideal.',
      D: 'Simplificar sistematicamente as perguntas, reduzindo escopo, variáveis e níveis de abstração envolvidos na instrução.',
    },
  },

  // ── Dados & Decisão (Q9-Q11) ─────────────────────────────
  {
    id: 9,
    dimension: 'dados_decisao',
    text: 'Qual fator mais impacta qualidade e confiabilidade de análises em IA?',
    options: {
      A: 'Velocidade de processamento do modelo.',
      B: 'Quantidade total de dados disponíveis.',
      C: 'Qualidade, consistência e governança dos dados.',
      D: 'Sofisticação técnica da ferramenta utilizada.',
    },
  },
  {
    id: 10,
    dimension: 'dados_decisao',
    text: 'Como IA deve ser utilizada na tomada de decisão?',
    options: {
      A: 'Como suporte estruturado com validação humana e governança.',
      B: 'Como apoio para acelerar análises.',
      C: 'Automatizando decisões sempre que possível.',
      D: 'Como suporte em decisões operacionais específicas.',
    },
  },
  {
    id: 11,
    dimension: 'dados_decisao',
    text: 'Uma organização deseja aumentar confiabilidade das respostas de IA. Qual ação tende a gerar maior impacto?',
    options: {
      A: 'Aumentar volume de dados utilizados.',
      B: 'Melhorar qualidade, estrutura e governança dos dados.',
      C: 'Aplicar seleção de variáveis para otimizar o modelo.',
      D: 'Adotar modelos maiores e mais avançados.',
    },
  },

  // ── Estratégia (Q12-Q15) ─────────────────────────────────
  {
    id: 12,
    dimension: 'estrategia',
    text: 'Qual fator é mais importante para escalar IA de forma sustentável?',
    options: {
      A: 'Priorizar projetos com retorno operacional imediato.',
      B: 'Integrar governança, dados e objetivos do negócio.',
      C: 'Coordenar parcialmente iniciativas estratégicas.',
      D: 'Expandir rapidamente iniciativas entre áreas.',
    },
  },
  {
    id: 13,
    dimension: 'estrategia',
    text: 'Qual visão representa maior maturidade estratégica em IA?',
    options: {
      A: 'Ferramenta para aumento de produtividade.',
      B: 'Capacidade estratégica de geração de vantagem competitiva.',
      C: 'Ferramenta para automação operacional.',
      D: 'Capacidade de otimização de processos.',
    },
  },
  {
    id: 14,
    dimension: 'estrategia',
    text: 'Qual nível de alinhamento entre IA e negócio tende a gerar melhores resultados?',
    options: {
      A: 'Alinhamento operacional com metas específicas.',
      B: 'Iniciativas independentes por área.',
      C: 'Integração direta com estratégia organizacional.',
      D: 'Alinhamento entre algumas equipes.',
    },
  },
  {
    id: 15,
    dimension: 'estrategia',
    text: 'Como organizações maduras identificam oportunidades de IA?',
    options: {
      A: 'De forma contínua alinhada à estratégia e geração de valor.',
      B: 'Com base em iniciativas das áreas.',
      C: 'Conforme surgem demandas operacionais.',
      D: 'A partir de projetos específicos de transformação.',
    },
  },

  // ── Riscos & Ética (Q16-Q17) ─────────────────────────────
  {
    id: 16,
    dimension: 'riscos_etica',
    text: 'O que caracteriza uma "alucinação" em IA?',
    options: {
      A: 'Uso de informações desatualizadas na resposta.',
      B: 'Geração de informações plausíveis, mas incorretas.',
      C: 'Resposta simplificada para facilitar interpretação.',
      D: 'Resposta incompleta por limitação de contexto.',
    },
  },
  {
    id: 17,
    dimension: 'riscos_etica',
    text: 'Como dados sensíveis devem ser utilizados em IA?',
    options: {
      A: 'Com governança formal, anonimização e controle de acesso.',
      B: 'Com diretrizes de uso e controles aplicados apenas em etapas críticas do fluxo de dados.',
      C: 'Com políticas internas de proteção e validação aplicadas conforme o tipo de caso de uso.',
      D: 'Com regras definidas por cada área, respeitando restrições operacionais e contexto de negócio.',
    },
  },

  // ── Agentes de IA (Q18-Q21) ──────────────────────────────
  {
    id: 18,
    dimension: 'agentes_ia',
    text: 'O que melhor caracteriza agentes de IA?',
    options: {
      A: 'Sistemas de automação de tarefas repetitivas.',
      B: 'Sistemas que executam fluxos com regras adaptativas.',
      C: 'Sistemas de resposta automatizada a comandos.',
      D: 'Sistemas que atuam com objetivos, contexto e ferramentas externas.',
    },
  },
  {
    id: 19,
    dimension: 'agentes_ia',
    text: 'Qual cenário representa melhor uso de agentes de IA?',
    options: {
      A: 'Execução de ações orientadas a objetivos definidos.',
      B: 'Resposta automatizada a solicitações simples.',
      C: 'Automação de fluxos com baixa autonomia decisória.',
      D: 'Execução automática de tarefas operacionais fixas.',
    },
  },
  {
    id: 20,
    dimension: 'agentes_ia',
    text: 'Qual prática representa maior maturidade no uso de agentes?',
    options: {
      A: 'Supervisão apenas em atividades críticas.',
      B: 'Uso com permissões, logs e monitoramento contínuo.',
      C: 'Uso experimental sem controle formal.',
      D: 'Autonomia total para maximizar eficiência.',
    },
  },
  {
    id: 21,
    dimension: 'agentes_ia',
    text: 'Qual alternativa descreve melhor a diferença entre assistentes e agentes de IA?',
    options: {
      A: 'Assistentes respondem perguntas; agentes executam ações orientadas a objetivos com autonomia e uso de ferramentas.',
      B: 'Assistentes usam apenas IA generativa; agentes não utilizam modelos de linguagem.',
      C: 'Assistentes são sempre supervisionados; agentes nunca precisam de supervisão humana.',
      D: 'Assistentes operam apenas em linguagem natural; agentes operam apenas em sistemas corporativos.',
    },
  },

  // ── Situações Executivas (Q22-Q24) ───────────────────────
  {
    id: 22,
    dimension: 'situacoes_executivas',
    text: 'Uma IA começa a gerar inconsistências em relatórios críticos. Qual abordagem tende a ser mais adequada?',
    options: {
      A: 'Revisar dados, modelo e mecanismos de validação antes de continuar.',
      B: 'Substituir imediatamente a ferramenta utilizada.',
      C: 'Reforçar supervisão humana e processos de conferência até que a causa seja identificada.',
      D: 'Manter operação enquanto ajustes graduais são feitos.',
    },
  },
  {
    id: 23,
    dimension: 'situacoes_executivas',
    text: 'Como casos de uso de IA devem ser priorizados?',
    options: {
      A: 'Pela urgência operacional das áreas.',
      B: 'Pelo impacto estratégico e disponibilidade de dados.',
      C: 'Pela facilidade de implementação técnica.',
      D: 'Pelo potencial de automação de tarefas.',
    },
  },
  {
    id: 24,
    dimension: 'situacoes_executivas',
    text: 'Como IA deve ser utilizada em decisões relevantes?',
    options: {
      A: 'Apenas em análises exploratórias preliminares.',
      B: 'Como substituição parcial da análise humana.',
      C: 'Como suporte estruturado à decisão humana.',
      D: 'Como mecanismo principal de decisão automatizada.',
    },
  },

  // ── Aplicação Técnica Básica (Q25-Q27) ───────────────────
  {
    id: 25,
    dimension: 'aplicacao_tecnica',
    text: 'Uma resposta de IA ficou genérica e pouco útil. Qual ação tende a melhorar o resultado?',
    options: {
      A: 'Refinar contexto e critérios do prompt.',
      B: 'Simplificar ainda mais a solicitação.',
      C: 'Trocar de ferramenta de IA.',
      D: 'Repetir a mesma pergunta de outra forma.',
    },
  },
  {
    id: 26,
    dimension: 'aplicacao_tecnica',
    text: 'Qual limitação é comum em modelos de linguagem?',
    options: {
      A: 'Dificuldade em lidar com linguagem natural.',
      B: 'Dependência exclusiva de internet em tempo real.',
      C: 'Possibilidade de gerar respostas inconsistentes ou incorretas.',
      D: 'Incapacidade de produzir respostas longas.',
    },
  },
  {
    id: 27,
    dimension: 'aplicacao_tecnica',
    text: 'Qual abordagem tende a ser mais eficiente ao trabalhar com IA?',
    options: {
      A: 'Utilizar prompts fixos para qualquer contexto.',
      B: 'Refinar solicitações progressivamente com base nas respostas obtidas.',
      C: 'Fazer perguntas genéricas para ganhar velocidade.',
      D: 'Buscar o prompt perfeito logo na primeira tentativa.',
    },
  },
]

export const TOTAL_QUESTIONS = QUESTIONS.length
