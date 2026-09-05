import { filterAssessments, summarize, themeMetrics } from './analytics.js'
import { KNOWLEDGE_VERSION } from './assessmentVersions.js'

const FIELDS = 'id,company_name,token,application_phase,baseline_survey_id'

export async function loadRoundPair(client, surveyId, signal) {
  const currentResult = await client.from('surveys').select(FIELDS).eq('id', surveyId).abortSignal(signal).single()
  if (currentResult.error) throw currentResult.error
  const current = currentResult.data
  if (!current || !['initial', 'final'].includes(current.application_phase)) throw new Error('ROUND_SCHEMA_MISSING')
  if (current.application_phase === 'final') {
    if (!current.baseline_survey_id) return { initial: null, final: current }
    const initialResult = await client.from('surveys').select(FIELDS).eq('id', current.baseline_survey_id).abortSignal(signal).single()
    if (initialResult.error) throw initialResult.error
    if (initialResult.data?.application_phase !== 'initial') throw new Error('Vínculo de aplicação inválido.')
    return { initial: initialResult.data, final: current }
  }
  const finalResult = await client.from('surveys').select(FIELDS).eq('baseline_survey_id', current.id).abortSignal(signal)
  if (finalResult.error) throw finalResult.error
  if (finalResult.data.length > 1 || finalResult.data.some(item => item.application_phase !== 'final')) throw new Error('Vínculo de aplicação inválido.')
  return { initial: current, final: finalResult.data[0] ?? null }
}

export async function createFinalRound(client, initialId) {
  const { data, error } = await client.rpc('create_final_survey', { initial_survey_id: initialId })
  if (error) throw error
  if (typeof data !== 'string' || !data) throw new Error('Não foi possível confirmar a criação da rodada final. Atualize antes de tentar novamente.')
  return data
}

// Discrete anonymous cohorts: deliberately ignores calendar windows, never pairs people.
export function compareRounds(initialRows, finalRows, filters) {
  const profile = { ...filters, start: '', end: '' }
  const initial = filterAssessments(initialRows, profile)
  const final = filterAssessments(finalRows, profile)
  const before = summarize(initial), after = summarize(final)
  const delta = before.mean != null && after.mean != null ? after.mean - before.mean : null
  const beforeThemes = themeMetrics(initial), afterThemes = themeMetrics(final)
  return {
    before, after, delta,
    comparable: filters.version === KNOWLEDGE_VERSION && delta !== null,
    themes: beforeThemes.map((theme, index) => ({
      name: theme.name, value: theme.value, benchmark: afterThemes[index].value,
      beforeN: theme.n, afterN: afterThemes[index].n,
      difference: theme.value != null && afterThemes[index].value != null ? afterThemes[index].value - theme.value : null,
    })),
  }
}
