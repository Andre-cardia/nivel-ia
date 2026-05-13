// scoring.js — Motor de pontuação — Diagnóstico de IA
//
// Perfil de Uso (Q1-Q2): escala progressiva A=0 B=1 C=2 D=3. Máx: 6pts.
// Conhecimento (Q3-Q34): resposta correta = 1pt. Máx: 32pts.
// Total máximo: 38 pontos.

const SCORE_MAP = { A: 0, B: 1, C: 2, D: 3 }

// Q1-Q2: escala de perfil (sem gabarito, pontuação progressiva)
export const SCALE_QUESTIONS = new Set([1, 2])

// Gabarito das 32 questões objetivas (Q3-Q34)
export const CORRECT_ANSWERS = {
  3:  'B', 4:  'C', 5:  'B',
  6:  'C', 7:  'A', 8:  'C', 9:  'A',
  10: 'B', 11: 'B', 12: 'A',
  13: 'C', 14: 'A', 15: 'A', 16: 'B',
  17: 'B', 18: 'B', 19: 'C', 20: 'A',
  21: 'B', 22: 'A', 23: 'C',
  24: 'D', 25: 'A', 26: 'B', 27: 'A',
  28: 'A', 29: 'B', 30: 'C',
  31: 'A', 32: 'C', 33: 'B', 34: 'C',
}

export const DIMENSIONS = {
  perfil_uso:           [1, 2],
  fundamentos_ia:       [3, 4, 5],
  ia_generativa:        [6, 7, 8, 9],
  uso_pratico:          [10, 11, 12],
  dados_decisao:        [13, 14, 15, 16],
  estrategia:           [17, 18, 19, 20],
  riscos_etica:         [21, 22, 23],
  agentes_ia:           [24, 25, 26, 27],
  situacoes_executivas: [28, 29, 30],
  aplicacao_tecnica:    [31, 32, 33, 34],
}

export const DIMENSION_LABELS = {
  perfil_uso:           'Perfil de Uso',
  fundamentos_ia:       'Fundamentos de IA',
  ia_generativa:        'IA Generativa',
  uso_pratico:          'Uso Prático',
  dados_decisao:        'Dados & Decisão',
  estrategia:           'Estratégia',
  riscos_etica:         'Riscos & Ética',
  agentes_ia:           'Agentes de IA',
  situacoes_executivas: 'Situações Executivas',
  aplicacao_tecnica:    'Aplicação Técnica Básica',
}

// Pontuação máxima por dimensão
export const DIMENSION_MAX = {
  perfil_uso:           6,   // Q1-Q2 escalares × 3
  fundamentos_ia:       3,   // Q3-Q5 objetivas
  ia_generativa:        4,   // Q6-Q9 objetivas
  uso_pratico:          3,   // Q10-Q12 objetivas
  dados_decisao:        4,   // Q13-Q16 objetivas
  estrategia:           4,   // Q17-Q20 objetivas
  riscos_etica:         3,   // Q21-Q23 objetivas
  agentes_ia:           4,   // Q24-Q27 objetivas
  situacoes_executivas: 3,   // Q28-Q30 objetivas
  aplicacao_tecnica:    4,   // Q31-Q34 objetivas
}

export const MAX_SCORE = 38
export const MAX_OBJECTIVE_SCORE = 32

export const LEVELS = [
  {
    key: 'inicial',
    label: 'Nível Inicial',
    min: 0,
    max: 9,
    description: 'Baixa familiaridade com IA, aplicações corporativas, riscos e critérios de uso.',
    recommendation: 'Letramento introdutório em IA, fundamentos de IA generativa, principais aplicações, riscos básicos e exemplos práticos por área.',
  },
  {
    key: 'basico',
    label: 'Nível Básico',
    min: 10,
    max: 18,
    description: 'Entende alguns conceitos e reconhece oportunidades gerais, mas apresenta lacunas relevantes em aplicação prática, dados, governança e tomada de decisão.',
    recommendation: 'Capacitação prática com foco em prompts, produtividade, análise de processos, riscos de uso e identificação de casos de uso.',
  },
  {
    key: 'intermediario',
    label: 'Nível Intermediário',
    min: 19,
    max: 27,
    description: 'Boa compreensão dos principais conceitos, identifica usos aplicáveis e entende riscos básicos.',
    recommendation: 'Workshop de IA aplicada ao negócio, priorização de casos de uso, desenho de pilotos, métricas, dados e governança inicial.',
  },
  {
    key: 'avancado',
    label: 'Nível Avançado',
    min: 28,
    max: 33,
    description: 'Boa maturidade sobre IA aplicada ao negócio, compreendendo estratégia, governança, dados, riscos, agentes e critérios de implementação.',
    recommendation: 'Construção de roadmap executivo, definição de governança, priorização de iniciativas, desenho de indicadores e estruturação de projetos-piloto.',
  },
  {
    key: 'estrategico',
    label: 'Nível Estratégico',
    min: 34,
    max: 38,
    description: 'Capacidade de pensar IA como alavanca de transformação organizacional, conectando estratégia, governança, dados, ROI, riscos, cultura e escala.',
    recommendation: 'Atuação em comitê de IA, liderança de transformação, definição de portfólio de iniciativas e implantação de modelo operacional de IA na empresa.',
  },
]

// Corte mínimo no bloco objetivo (Q3-Q34) para níveis avançados
export const OBJECTIVE_MINIMUMS = {
  avancado:    20,
  estrategico: 26,
}

/** Pontuação de uma questão individual */
function scoreQuestion(questionId, answer) {
  if (answer == null) return 0
  if (SCALE_QUESTIONS.has(questionId)) return SCORE_MAP[answer] ?? 0
  return CORRECT_ANSWERS[questionId] === answer ? 1 : 0
}

/** Calcula pontuação total */
export function calculateTotalScore(answers) {
  return Object.entries(answers).reduce((sum, [id, opt]) => sum + scoreQuestion(Number(id), opt), 0)
}

/** Calcula pontuação apenas no bloco objetivo (Q3-Q34) */
export function calculateObjectiveScore(answers) {
  return Object.entries(answers).reduce((sum, [id, opt]) => {
    const qId = Number(id)
    if (qId >= 3 && qId <= 34) return sum + scoreQuestion(qId, opt)
    return sum
  }, 0)
}

/** Calcula pontuação por dimensão */
export function calculateDimensionScores(answers) {
  return Object.entries(DIMENSIONS).reduce((acc, [dim, questions]) => {
    acc[dim] = questions.reduce((s, q) => s + scoreQuestion(q, answers[q]), 0)
    return acc
  }, {})
}

/**
 * Determina o nível com corte mínimo no bloco objetivo para Avançado/Estratégico.
 * Se o participante atingir pontuação total de Avançado/Estratégico mas não cumprir
 * o mínimo objetivo, é rebaixado um nível.
 */
export function determineLevel(totalScore, objectiveScore) {
  const level = LEVELS.find(l => totalScore >= l.min && totalScore <= l.max) ?? LEVELS[0]

  if (objectiveScore != null) {
    const minObj = OBJECTIVE_MINIMUMS[level.key]
    if (minObj != null && objectiveScore < minObj) {
      const currentIndex = LEVELS.indexOf(level)
      return LEVELS[Math.max(0, currentIndex - 1)]
    }
  }

  return level
}
