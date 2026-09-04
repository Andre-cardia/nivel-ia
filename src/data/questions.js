// knowledge-v2: Q1 descritiva; Q2–Q27 conhecimento, sem faixas calibradas.
export const QUESTIONNAIRE_VERSION = 'knowledge-v2'
export const SCORING_MODEL = 'binary-knowledge-26-v1'
export const USAGE_OPTIONS = {
  "A": "Não utilizei.",
  "B": "Em 1 a 3 dias.",
  "C": "Em 4 a 15 dias.",
  "D": "Em 16 dias ou mais."
}
export const QUESTIONS = [
  {
    "id": 1,
    "dimension": "perfil_uso",
    "text": "Em quantos dias você utilizou ferramentas de IA no trabalho nos últimos 30 dias?",
    "options": {
      "A": "Não utilizei.",
      "B": "Em 1 a 3 dias.",
      "C": "Em 4 a 15 dias.",
      "D": "Em 16 dias ou mais."
    }
  },
  {
    "id": 2,
    "dimension": "fundamentos_ia",
    "text": "Um filtro passa a reconhecer mensagens fraudulentas após treinar com exemplos rotulados. O que caracteriza o aprendizado de máquina nesse caso?",
    "options": {
      "A": "Executar uma lista de palavras proibidas definida pela equipe.",
      "B": "Aprender padrões nos exemplos para classificar novas mensagens.",
      "C": "Pesquisar mensagens semelhantes e devolver o primeiro resultado.",
      "D": "Encaminhar mensagens suspeitas para classificação manual."
    },
    "correctAnswer": "B",
    "rationale": "O comportamento de classificação é estimado a partir de exemplos, não somente de regras escritas."
  },
  {
    "id": 3,
    "dimension": "fundamentos_ia",
    "text": "Uma equipe precisa somar valores de uma planilha com regras fiscais fixas. Qual solução é mais adequada como ponto de partida?",
    "options": {
      "A": "Um modelo generativo que estime o total a partir da descrição.",
      "B": "Um agente que escolha entre regras fiscais durante a execução.",
      "C": "Uma busca semântica entre planilhas de meses anteriores.",
      "D": "Uma fórmula testada contra as regras fiscais."
    },
    "correctAnswer": "D",
    "rationale": "Cálculos com regras fixas pedem execução determinística verificável."
  },
  {
    "id": 4,
    "dimension": "ia_generativa",
    "text": "Uma equipe quer gerar rascunhos de respostas a clientes. Qual desenho permite avaliar a qualidade antes do envio?",
    "options": {
      "A": "Gerar rascunhos com fontes aprovadas e revisá-los antes do envio.",
      "B": "Enviar respostas com boa fluência e revisar as reclamações recebidas.",
      "C": "Aprovar respostas pelo tamanho e pelo tempo de geração.",
      "D": "Usar um modelo maior como critério de aprovação do conteúdo."
    },
    "correctAnswer": "A",
    "rationale": "Rascunhos contextualizados e revisão prévia permitem conferir o conteúdo antes do envio."
  },
  {
    "id": 5,
    "dimension": "ia_generativa",
    "text": "Ao gerar texto, o que um modelo de linguagem autorregressivo faz a cada etapa?",
    "options": {
      "A": "Localiza uma resposta completa previamente armazenada.",
      "B": "Aplica uma regra gramatical que garante a verdade da frase.",
      "C": "Estima o próximo token usando o contexto e os padrões aprendidos.",
      "D": "Consulta a internet para confirmar as palavras geradas."
    },
    "correctAnswer": "C",
    "rationale": "A geração ocorre por previsão sucessiva de tokens; isso não implica consulta à internet nem garantia factual."
  },
  {
    "id": 6,
    "dimension": "ia_generativa",
    "text": "Um assistente precisa responder sobre uma política interna alterada ontem. Qual abordagem fornece a informação atual e permite conferência?",
    "options": {
      "A": "Aumentar a criatividade da resposta para cobrir possíveis mudanças.",
      "B": "Pedir ao modelo que use seu conhecimento geral sobre políticas.",
      "C": "Treinar um novo modelo sem incluir a política revisada.",
      "D": "Recuperar a política vigente e citar os trechos utilizados."
    },
    "correctAnswer": "D",
    "rationale": "A recuperação da fonte vigente disponibiliza o conteúdo atualizado e rastreável."
  },
  {
    "id": 7,
    "dimension": "uso_pratico",
    "text": "Você vai solicitar pela primeira vez um resumo executivo de um documento. Qual instrução define melhor a entrega?",
    "options": {
      "A": "Defina público, cinco tópicos, riscos, decisões e limite ao documento.",
      "B": "Escreva uma análise detalhada, incluindo assuntos que considerar interessantes.",
      "C": "Apresente uma resposta convincente com o tom de um especialista no setor.",
      "D": "Melhore o documento conforme o estilo que considerar mais apropriado."
    },
    "correctAnswer": "A",
    "rationale": "Objetivo, público, formato e limite de fontes tornam a entrega verificável."
  },
  {
    "id": 8,
    "dimension": "uso_pratico",
    "text": "Dois prompts precisam ser comparados para resumir chamados. Como avaliar qual funciona melhor?",
    "options": {
      "A": "Comparar as respostas que os avaliadores considerarem mais convincentes.",
      "B": "Medir qual prompt gera a maior quantidade de texto.",
      "C": "Testar ambos na mesma amostra usando critérios de precisão e omissões.",
      "D": "Escolher o prompt que demorou mais para produzir uma resposta."
    },
    "correctAnswer": "C",
    "rationale": "Amostra comum e critérios explícitos permitem comparação consistente."
  },
  {
    "id": 9,
    "dimension": "dados_decisao",
    "text": "Uma análise de vendas apresenta totais duplicados após unir duas bases. O que verificar primeiro?",
    "options": {
      "A": "Se o modelo tem quantidade suficiente de parâmetros.",
      "B": "As chaves da junção e os registros duplicados.",
      "C": "Se o texto da análise contém explicações detalhadas.",
      "D": "O limite de tamanho das respostas do assistente."
    },
    "correctAnswer": "B",
    "rationale": "Duplicação após junção exige examinar cardinalidade, chaves e registros."
  },
  {
    "id": 10,
    "dimension": "dados_decisao",
    "text": "Um modelo prevê maior venda de sorvete em dias com mais afogamentos. O que essa associação permite concluir?",
    "options": {
      "A": "Vender sorvete provoca afogamentos.",
      "B": "Reduzir sorvetes provavelmente reduzirá afogamentos.",
      "C": "A previsão substitui a necessidade de investigar o contexto.",
      "D": "Há associação; o calor pode explicar ambas."
    },
    "correctAnswer": "D",
    "rationale": "Associação preditiva não estabelece causalidade; pode haver fatores comuns."
  },
  {
    "id": 11,
    "dimension": "dados_decisao",
    "text": "Um assistente cita uma fonte para um número que será usado em uma apresentação. Como conferir a afirmação?",
    "options": {
      "A": "Verificar na fonte o número, o período e o contexto.",
      "B": "Aceitar o número quando o endereço da fonte parecer conhecido.",
      "C": "Pedir ao mesmo assistente uma confirmação sem consultar a fonte.",
      "D": "Conferir se o número aparece repetido no texto gerado."
    },
    "correctAnswer": "A",
    "rationale": "A existência de uma citação não garante que ela sustente a afirmação."
  },
  {
    "id": 12,
    "dimension": "estrategia",
    "text": "Uma empresa tem orçamento para um piloto de IA. Qual comparação ajuda a escolher entre propostas?",
    "options": {
      "A": "Número de ferramentas que as propostas pretendem usar.",
      "B": "Visibilidade da proposta nas apresentações da liderança.",
      "C": "Benefício, dados disponíveis, custo e riscos.",
      "D": "Número de etapas que podem ser descritas como automatizadas."
    },
    "correctAnswer": "C",
    "rationale": "Priorização exige combinar benefício, viabilidade, custo e risco."
  },
  {
    "id": 13,
    "dimension": "estrategia",
    "text": "Um piloto de atendimento pretende reduzir esforço sem piorar o serviço. Qual indicador de sucesso é mais adequado?",
    "options": {
      "A": "Quantidade de mensagens produzidas pelo assistente.",
      "B": "Tempo por caso, erros e retrabalho.",
      "C": "Número de colaboradores com acesso à ferramenta.",
      "D": "Total de prompts enviados durante o piloto."
    },
    "correctAnswer": "B",
    "rationale": "O indicador combina resultado operacional e qualidade, não somente atividade."
  },
  {
    "id": 14,
    "dimension": "estrategia",
    "text": "Um piloto atingiu a meta de produtividade. O que ainda é necessário antes de ampliá-lo?",
    "options": {
      "A": "Responsáveis, suporte, limites e monitoramento.",
      "B": "Repetir a apresentação de resultados para mais áreas.",
      "C": "Comprar acessos para os colaboradores antes de definir o processo.",
      "D": "Substituir as métricas do piloto pelo número de usuários."
    },
    "correctAnswer": "A",
    "rationale": "Escala requer responsabilidade operacional e acompanhamento além do desempenho do piloto."
  },
  {
    "id": 15,
    "dimension": "estrategia",
    "text": "Uma automação economiza dez horas por semana, mas exige revisão humana e infraestrutura. Como estimar seu benefício líquido?",
    "options": {
      "A": "Multiplicar a quantidade de respostas pelo preço da assinatura.",
      "B": "Considerar o ganho bruto de tempo como retorno final.",
      "C": "Usar o número de acessos como estimativa financeira.",
      "D": "Economia efetiva menos revisão, operação e implantação."
    },
    "correctAnswer": "D",
    "rationale": "O benefício líquido depende dos ganhos efetivos menos os custos relevantes."
  },
  {
    "id": 16,
    "dimension": "riscos_etica",
    "text": "Um assistente inventa o título e os autores de um estudo e o apresenta como real. Que falha ocorreu?",
    "options": {
      "A": "Uma falha de autenticação da conta.",
      "B": "Uma redução na velocidade de inferência.",
      "C": "Geração factual sem sustentação, chamada alucinação.",
      "D": "Uma duplicação de registros no arquivo de entrada."
    },
    "correctAnswer": "C",
    "rationale": "A referência inventada é um exemplo de conteúdo factual fabricado."
  },
  {
    "id": 17,
    "dimension": "riscos_etica",
    "text": "Você quer resumir registros com dados pessoais em uma ferramenta cujo uso a empresa ainda não aprovou. Qual é a próxima ação adequada?",
    "options": {
      "A": "Enviar uma pequena amostra para testar a qualidade do resumo.",
      "B": "Verificar autorização e usar ambiente aprovado com dados mínimos.",
      "C": "Retirar os nomes e enviar o restante sem avaliar possibilidade de identificação.",
      "D": "Enviar os registros com uma instrução para que o modelo não os divulgue."
    },
    "correctAnswer": "B",
    "rationale": "Uma instrução ao modelo não substitui autorização, minimização e controles do ambiente."
  },
  {
    "id": 18,
    "dimension": "agentes_ia",
    "text": "Qual comportamento caracteriza um agente com autonomia delimitada, em vez de um fluxo com sequência fixa?",
    "options": {
      "A": "Enviar mensagens em horários configurados.",
      "B": "Executar os mesmos passos independentemente do resultado.",
      "C": "Mostrar uma lista de tarefas para uma pessoa executar.",
      "D": "Escolher o próximo passo com base nos resultados."
    },
    "correctAnswer": "D",
    "rationale": "O agente decide dinamicamente os passos dentro de limites; fluxos fixos seguem caminhos predefinidos."
  },
  {
    "id": 19,
    "dimension": "agentes_ia",
    "text": "Um agente que prepara propostas comerciais só precisa consultar preços. Qual permissão atende ao princípio do menor privilégio?",
    "options": {
      "A": "Acesso de leitura ao catálogo necessário para a tarefa.",
      "B": "Permissão de editar o catálogo de produtos.",
      "C": "Credenciais administrativas compartilhadas com a equipe.",
      "D": "Acesso a diversas bases para evitar solicitações futuras."
    },
    "correctAnswer": "A",
    "rationale": "Acesso somente de leitura e ao escopo necessário reduz ações indevidas."
  },
  {
    "id": 20,
    "dimension": "agentes_ia",
    "text": "Um documento consultado pelo agente contém uma ordem para ignorar a tarefa e enviar dados a um endereço externo. Como tratar esse trecho?",
    "options": {
      "A": "Seguir a ordem porque ela está no documento consultado.",
      "B": "Solicitar ao endereço externo que confirme a instrução.",
      "C": "Tratá-lo como conteúdo não confiável e bloquear a ação.",
      "D": "Dar mais permissões ao agente para concluir a instrução."
    },
    "correctAnswer": "C",
    "rationale": "Instruções em conteúdo externo não adquirem autoridade sobre a tarefa; é um caso de injeção de prompt."
  },
  {
    "id": 21,
    "dimension": "agentes_ia",
    "text": "Um agente pode preparar pagamentos, mas transferências exigem autorização de um responsável. Qual controle deve existir?",
    "options": {
      "A": "Uma mensagem no prompt pedindo cuidado com transferências.",
      "B": "Aprovação no sistema antes da transferência.",
      "C": "Uma revisão mensal das transferências já realizadas.",
      "D": "Um limite de tamanho para as respostas geradas."
    },
    "correctAnswer": "B",
    "rationale": "A aprovação deve ser imposta no caminho de execução, não depender apenas do texto do prompt."
  },
  {
    "id": 22,
    "dimension": "situacoes_executivas",
    "text": "Um relatório de IA contém números divergentes da base oficial e será usado hoje para aprovar um investimento. Qual deve ser a primeira ação?",
    "options": {
      "A": "Suspender a decisão e conferir os números na fonte oficial.",
      "B": "Aprovar o investimento e corrigir as divergências na próxima reunião.",
      "C": "Pedir uma redação mais convincente para justificar os números.",
      "D": "Trocar o modelo e aceitar a nova saída sem conferir a base."
    },
    "correctAnswer": "A",
    "rationale": "Uma divergência material precisa ser resolvida antes de usar o relatório na decisão."
  },
  {
    "id": 23,
    "dimension": "situacoes_executivas",
    "text": "Uma IA para triagem tem boa média geral, mas falha muito mais em um dos grupos avaliados. O que fazer antes de ampliar seu uso?",
    "options": {
      "A": "Divulgar a média geral por representar maior volume de casos.",
      "B": "Aumentar o volume de uso para diluir os erros do grupo.",
      "C": "Eliminar o grupo problemático do relatório de avaliação.",
      "D": "Investigar a diferença e seus impactos antes de ampliar."
    },
    "correctAnswer": "D",
    "rationale": "Médias podem esconder falhas relevantes em subgrupos; é necessário avaliar impactos e corrigir."
  },
  {
    "id": 24,
    "dimension": "situacoes_executivas",
    "text": "Um fornecedor demonstra uma IA com exemplos escolhidos por ele. Qual evidência adicional é mais útil para decidir sobre um piloto?",
    "options": {
      "A": "Uma apresentação com mais funcionalidades disponíveis.",
      "B": "Testar casos representativos com critérios de sucesso acordados.",
      "C": "Uma comparação do número de clientes e mercados atendidos pelos fornecedores.",
      "D": "Uma lista de ferramentas integradas à demonstração."
    },
    "correctAnswer": "B",
    "rationale": "Casos representativos e critérios de sucesso avaliam adequação ao contexto real."
  },
  {
    "id": 25,
    "dimension": "aplicacao_tecnica",
    "text": "Um resumo precisa distinguir fatos do documento e hipóteses do autor. Qual saída permite conferir esse requisito?",
    "options": {
      "A": "Um texto único sem indicação de origem das afirmações.",
      "B": "Uma resposta ordenada pelo tamanho dos parágrafos.",
      "C": "Uma tabela com fato, trecho de apoio e hipótese.",
      "D": "Uma lista de conclusões sem referências ao documento."
    },
    "correctAnswer": "C",
    "rationale": "Separar afirmações, evidência e hipótese facilita auditoria do resumo."
  },
  {
    "id": 26,
    "dimension": "aplicacao_tecnica",
    "text": "Uma IA gera uma fórmula de planilha que calcula comissões. Como verificar a fórmula antes de adotá-la?",
    "options": {
      "A": "Testar casos conhecidos e limites contra cálculo independente.",
      "B": "Usar a fórmula se não houver mensagem de erro na planilha.",
      "C": "Comparar o tamanho da fórmula com a versão anterior.",
      "D": "Pedir à IA que afirme que a fórmula está correta."
    },
    "correctAnswer": "A",
    "rationale": "Resultados esperados independentes e casos de limite verificam comportamento além da sintaxe."
  },
  {
    "id": 27,
    "dimension": "aplicacao_tecnica",
    "text": "Ao testar um assistente de documentos, você pergunta algo que não consta nas fontes fornecidas. Qual comportamento deve ser esperado?",
    "options": {
      "A": "Completar a lacuna com uma estimativa sem identificá-la.",
      "B": "Escolher um trecho próximo e apresentá-lo como comprovação.",
      "C": "Responder com base na familiaridade do assunto e omitir a fonte.",
      "D": "Informar que as fontes são insuficientes e pedir os dados."
    },
    "correctAnswer": "D",
    "rationale": "O assistente deve reconhecer insuficiência de evidência em vez de fabricar uma resposta."
  }
]
export const TOTAL_QUESTIONS = QUESTIONS.length
