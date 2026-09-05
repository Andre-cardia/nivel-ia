import { historicalRows } from './legacyAnalytics.js'

// Explicit columns: analytics never needs respondent names or free-text answers.
const COLUMNS = 'id,survey_id,created_at,respondent_role,respondent_department,total_score,level,questionnaire_version,scoring_model,score_max,answer_details,usage_frequency,tools_used'

export async function loadAnalyticsAssessments(client, surveyId, signal) {
  const rows = []
  const seen = new Set()
  let expected = null
  // count + stable order also detect a moving dataset; do not display partial totals.
  while (expected === null || rows.length < expected) {
    let query = client.from('assessments').select(COLUMNS, { count: 'exact' })
      .order('created_at', { ascending: true }).order('id', { ascending: true })
    if (surveyId) query = query.eq('survey_id', surveyId)
    else query = query.not('survey_id', 'is', null)
    const { data, error, count } = await query.range(rows.length, rows.length + 499).abortSignal(signal)
    if (error) throw error
    if (count === null || (expected !== null && count !== expected)) throw new Error('Os dados mudaram durante a leitura. Atualize o painel.')
    expected = count
    if (!data?.length && rows.length < expected) throw new Error('Leitura incompleta. Atualize o painel.')
    for (const row of data ?? []) {
      if (seen.has(row.id)) throw new Error('Os dados mudaram durante a leitura. Atualize o painel.')
      seen.add(row.id)
      rows.push(row)
    }
  }
  return rows
}

// Before v9, answers lived in assessment_answers, not answer_details. Read only
// the selected historical assessments, in bounded batches with complete paging.
export async function loadHistoricalAnswers(client, assessments, signal) {
  const historical = historicalRows(assessments)
  const answers = historical.flatMap(row => Array.isArray(row.answer_details)
    ? row.answer_details.filter(answer => answer && typeof answer === 'object').map(answer => ({ ...answer, assessment_id: row.id })) : [])
  const ids = [...new Set(historical.filter(row => !Array.isArray(row.answer_details) || !row.answer_details.length).map(row => row.id))]
  for (let offset = 0; offset < ids.length; offset += 50) {
    const batch = ids.slice(offset, offset + 50)
    const seen = new Set()
    let expected = null
    while (expected === null || seen.size < expected) {
      const result = await client.from('assessment_answers')
        .select('id,assessment_id,question_number,dimension,selected_option,score', { count: 'exact' })
        .in('assessment_id', batch).order('id', { ascending: true })
        .range(seen.size, seen.size + 499).abortSignal(signal)
      if (result.error) throw result.error
      if (result.count == null || (expected !== null && result.count !== expected)) throw new Error('As respostas históricas mudaram durante a leitura. Atualize.')
      expected = result.count
      if (!result.data?.length && seen.size < expected) throw new Error('Leitura histórica incompleta. Atualize.')
      for (const answer of result.data ?? []) {
        if (seen.has(answer.id) || !batch.includes(answer.assessment_id)) throw new Error('Leitura histórica inconsistente. Atualize.')
        seen.add(answer.id)
        answers.push(answer)
      }
    }
  }
  return answers
}

export async function loadSurveyChoices(client, signal, withPhase = true) {
  const rows = []
  let count = Infinity
  while (rows.length < count) {
    const result = await client.from('surveys').select(withPhase ? 'id,company_name,application_phase' : 'id,company_name', { count: 'exact' })
      .order('id').range(rows.length, rows.length + 499).abortSignal(signal)
    // The core dashboard remains readable before migration v11 is applied.
    if (withPhase && result.error?.code === '42703') return loadSurveyChoices(client, signal, false)
    if (result.error) throw result.error
    if (result.count === null || (!result.data?.length && rows.length < result.count)) throw new Error('Não foi possível carregar as pesquisas.')
    count = result.count
    rows.push(...result.data)
  }
  return rows
}
