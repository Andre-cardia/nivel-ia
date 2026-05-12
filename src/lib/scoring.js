// scoring.js — Motor de pontuação — Assessment de Maturidade Executiva em IA
//
// Bloco A (Q1-Q35): questões objetivas, resposta correta = 1pt. Máx: 35pts.
// Bloco B (Q36-Q43): escala progressiva A=0 B=1 C=2 D=3. Máx: 24pts.
// Total máximo: 59 pontos.

const SCORE_MAP = { A: 0, B: 1, C: 2, D: 3 }

// Gabarito das 35 questões objetivas (Q1-Q35)
export const CORRECT_ANSWERS = {
  1:  'A', 2:  'B', 3:  'C', 4:  'B',
  5:  'C', 6:  'A', 7:  'C', 8:  'A',
  9:  'B', 10: 'B', 11: 'C', 12: 'A',
  13: 'C', 14: 'A', 15: 'A', 16: 'B',
  17: 'B', 18: 'B', 19: 'C', 20: 'A',
  21: 'B', 22: 'B', 23: 'A', 24: 'C',
  25: 'D', 26: 'A', 27: 'B',
  28: 'A', 29: 'B', 30: 'C', 31: 'C',
  32: 'A', 33: 'C', 34: 'B', 35: 'C',
}

// Q36-Q43: escala progressiva (maturidade/percepção)
export const SCALE_QUESTIONS = new Set([36, 37, 38, 39, 40, 41, 42, 43])

export const DIMENSIONS = {
  fundamentos_ia:       [1, 2, 3, 4],
  ia_generativa:        [5, 6, 7, 8],
  uso_pratico:          [9, 10, 11, 12],
  dados_decisao:        [13, 14, 15, 16],
  estrategia:           [17, 18, 19, 20],
  riscos_etica:         [21, 22, 23, 24],
  agentes_ia:           [25, 26, 27],
  situacoes_executivas: [28, 29, 30, 31],
  aplicacao_tecnica:    [32, 33, 34, 35],
  maturidade_percepcao: [36, 37, 38, 39, 40, 41, 42, 43],
}

export const DIMENSION_LABELS = {
  fundamentos_ia:       'Fundamentos de IA',
  ia_generativa:        'IA Generativa',
  uso_pratico:          'Uso Prático',
  dados_decisao:        'Dados e Decisão',
  estrategia:           'Estratégia',
  riscos_etica:         'Riscos, Ética e Governança',
  agentes_ia:           'Agentes de IA',
  situacoes_executivas: 'Situações Executivas',
  aplicacao_tecnica:    'Aplicação Técnica Básica',
  maturidade_percepcao: 'Maturidade, Frequência e Percepção',
}

// Pontuação máxima por dimensão
export const DIMENSION_MAX = {
  fundamentos_ia:       4,   // Q1-Q4 objetivas
  ia_generativa:        4,   // Q5-Q8 objetivas
  uso_pratico:          4,   // Q9-Q12 objetivas
  dados_decisao:        4,   // Q13-Q16 objetivas
  estrategia:           4,   // Q17-Q20 objetivas
  riscos_etica:         4,   // Q21-Q24 objetivas
  agentes_ia:           3,   // Q25-Q27 objetivas
  situacoes_executivas: 4,   // Q28-Q31 objetivas
  aplicacao_tecnica:    4,   // Q32-Q35 objetivas
  maturidade_percepcao: 24,  // Q36-Q43 escalares × 3
}

export const MAX_SCORE = 59
export const MAX_OBJECTIVE_SCORE = 35

export const LEVELS = [
  {
    key: 'inicial',
    label: 'Nível Inicial',
    min: 0,
    max: 14,
    description: 'O executivo ainda possui baixa familiaridade com IA, aplicações corporativas, riscos e critérios de uso.',
    recommendation: 'Letramento introdutório em IA, fundamentos de IA generativa, principais aplicações, riscos básicos e exemplos práticos por área.',
  },
  {
    key: 'basico',
    label: 'Nível Básico',
    min: 15,
    max: 28,
    description: 'O executivo entende alguns conceitos e reconhece oportunidades gerais, mas ainda apresenta lacunas relevantes em aplicação prática, dados, governança, agentes e tomada de decisão.',
    recommendation: 'Capacitação prática com foco em prompts, produtividade, análise de processos, riscos de uso e identificação de casos de uso.',
  },
  {
    key: 'intermediario',
    label: 'Nível Intermediário',
    min: 29,
    max: 42,
    description: 'O executivo possui boa compreensão dos principais conceitos, identifica usos aplicáveis e entende riscos básicos.',
    recommendation: 'Workshop de IA aplicada ao negócio, priorização de casos de uso, desenho de pilotos, métricas, dados e governança inicial.',
  },
  {
    key: 'avancado',
    label: 'Nível Avançado',
    min: 43,
    max: 52,
    description: 'O executivo demonstra boa maturidade sobre IA aplicada ao negócio, compreendendo estratégia, governança, dados, riscos, agentes e critérios de implementação.',
    recommendation: 'Construção de roadmap executivo, definição de governança, priorização de iniciativas, desenho de indicadores e estruturação de projetos-piloto.',
  },
  {
    key: 'estrategico',
    label: 'Nível Estratégico',
    min: 53,
    max: 59,
    description: 'O executivo demonstra capacidade de pensar IA como alavanca de transformação organizacional, conectando estratégia, governança, dados, ROI, riscos, cultura e escala.',
    recommendation: 'Atuação em comitê de IA, liderança de transformação, definição de portfólio de iniciativas e implantação de modelo operacional de IA na empresa.',
  },
]

// Corte mínimo no bloco objetivo para níveis avançados
export const OBJECTIVE_MINIMUMS = {
  avancado:    26,
  estrategico: 30,
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

/** Calcula pontuação apenas no bloco objetivo (Q1-Q35) */
export function calculateObjectiveScore(answers) {
  return Object.entries(answers).reduce((sum, [id, opt]) => {
    const qId = Number(id)
    if (qId >= 1 && qId <= 35) return sum + scoreQuestion(qId, opt)
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
