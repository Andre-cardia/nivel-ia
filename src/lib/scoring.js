// scoring.js — Motor de pontuação — Diagnóstico de IA
//
// Perfil de Uso (Q1): escala progressiva A=0 B=1 C=2 D=3. Máx: 3pts.
// Conhecimento (Q2-Q27): resposta correta = 1pt. Máx: 26pts.
// Total máximo: 29 pontos.

const SCORE_MAP = { A: 0, B: 1, C: 2, D: 3 }

// Q1: escala de perfil (sem gabarito, pontuação progressiva)
export const SCALE_QUESTIONS = new Set([1])

// Gabarito das 26 questões objetivas (Q2-Q27)
export const CORRECT_ANSWERS = {
  2:  'B', 3:  'C',
  4:  'C', 5:  'C', 6:  'A',
  7:  'B', 8:  'A',
  9:  'C', 10: 'A', 11: 'B',
  12: 'B', 13: 'B', 14: 'C', 15: 'A',
  16: 'B', 17: 'A',
  18: 'D', 19: 'A', 20: 'B', 21: 'A',
  22: 'A', 23: 'B', 24: 'C',
  25: 'A', 26: 'C', 27: 'B',
}

export const DIMENSIONS = {
  perfil_uso:           [1],
  fundamentos_ia:       [2, 3],
  ia_generativa:        [4, 5, 6],
  uso_pratico:          [7, 8],
  dados_decisao:        [9, 10, 11],
  estrategia:           [12, 13, 14, 15],
  riscos_etica:         [16, 17],
  agentes_ia:           [18, 19, 20, 21],
  situacoes_executivas: [22, 23, 24],
  aplicacao_tecnica:    [25, 26, 27],
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
  perfil_uso:           3,   // Q1 escalar × 3
  fundamentos_ia:       2,   // Q2-Q3 objetivas
  ia_generativa:        3,   // Q4-Q6 objetivas
  uso_pratico:          2,   // Q7-Q8 objetivas
  dados_decisao:        3,   // Q9-Q11 objetivas
  estrategia:           4,   // Q12-Q15 objetivas
  riscos_etica:         2,   // Q16-Q17 objetivas
  agentes_ia:           4,   // Q18-Q21 objetivas
  situacoes_executivas: 3,   // Q22-Q24 objetivas
  aplicacao_tecnica:    3,   // Q25-Q27 objetivas
}

export const MAX_SCORE = 29
export const MAX_OBJECTIVE_SCORE = 26

export const LEVELS = [
  {
    key: 'inicial',
    label: 'Nível Inicial',
    min: 0,
    max: 7,
    description: 'Baixa familiaridade com IA, aplicações corporativas, riscos e critérios de uso.',
    recommendation: 'Letramento introdutório em IA, fundamentos de IA generativa, principais aplicações, riscos básicos e exemplos práticos por área.',
  },
  {
    key: 'basico',
    label: 'Nível Básico',
    min: 8,
    max: 14,
    description: 'Entende alguns conceitos e reconhece oportunidades gerais, mas apresenta lacunas relevantes em aplicação prática, dados, governança e tomada de decisão.',
    recommendation: 'Capacitação prática com foco em prompts, produtividade, análise de processos, riscos de uso e identificação de casos de uso.',
  },
  {
    key: 'intermediario',
    label: 'Nível Intermediário',
    min: 15,
    max: 21,
    description: 'Boa compreensão dos principais conceitos, identifica usos aplicáveis e entende riscos básicos.',
    recommendation: 'Workshop de IA aplicada ao negócio, priorização de casos de uso, desenho de pilotos, métricas, dados e governança inicial.',
  },
  {
    key: 'avancado',
    label: 'Nível Avançado',
    min: 22,
    max: 26,
    description: 'Boa maturidade sobre IA aplicada ao negócio, compreendendo estratégia, governança, dados, riscos, agentes e critérios de implementação.',
    recommendation: 'Construção de roadmap executivo, definição de governança, priorização de iniciativas, desenho de indicadores e estruturação de projetos-piloto.',
  },
  {
    key: 'estrategico',
    label: 'Nível Estratégico',
    min: 27,
    max: 29,
    description: 'Capacidade de pensar IA como alavanca de transformação organizacional, conectando estratégia, governança, dados, ROI, riscos, cultura e escala.',
    recommendation: 'Atuação em comitê de IA, liderança de transformação, definição de portfólio de iniciativas e implantação de modelo operacional de IA na empresa.',
  },
]

// Corte mínimo no bloco objetivo (Q2-Q27) para níveis avançados
export const OBJECTIVE_MINIMUMS = {
  avancado:    16,
  estrategico: 21,
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

/** Calcula pontuação apenas no bloco objetivo (Q2-Q27) */
export function calculateObjectiveScore(answers) {
  return Object.entries(answers).reduce((sum, [id, opt]) => {
    const qId = Number(id)
    if (qId >= 2 && qId <= 27) return sum + scoreQuestion(qId, opt)
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
