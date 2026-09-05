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
