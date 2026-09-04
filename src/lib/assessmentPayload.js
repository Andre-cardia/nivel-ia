import { QUESTIONS, QUESTIONNAIRE_VERSION, SCORING_MODEL } from '../data/questions.js'
import { buildAnswerDetails, calculateTotalScore, MAX_SCORE } from './scoring.js'

export function buildAssessmentPayload({
  assessmentId,
  survey,
  identification,
  answers,
  openAnswer,
  toolsUsed,
  toolsOther,
}) {
  if (!answers || QUESTIONS.some(question => !Object.hasOwn(question.options, answers[question.id]))) {
    throw new Error('O questionário contém respostas inválidas ou incompletas.')
  }
  const answerDetails = buildAnswerDetails(answers)

  return {
    id: assessmentId,
    survey_id: survey?.id || null,
    company_name: survey?.company_name || identification.companyName,
    respondent_name: identification.stakeholderName || null,
    respondent_role: identification.stakeholderRole || null,
    respondent_department: identification.stakeholderDepartment || null,
    total_score: calculateTotalScore(answers),
    level: 'nao_classificado',
    score_max: MAX_SCORE,
    questionnaire_version: QUESTIONNAIRE_VERSION,
    scoring_model: SCORING_MODEL,
    usage_frequency: answers[1],
    open_answer: openAnswer || null,
    tools_used: toolsUsed,
    tools_other: toolsUsed.includes('Outras') ? (toolsOther ?? '').trim() || null : null,
    answer_details: answerDetails,
  }
}

export function isAssessmentRetryDuplicate(error, assessmentId) {
  if (error?.code !== '23505') return false
  return Boolean(
    error.message?.includes('assessments_pkey')
      || error.details?.includes(`(id)=(${assessmentId})`),
  )
}
