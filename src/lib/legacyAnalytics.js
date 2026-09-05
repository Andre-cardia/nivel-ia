import { assessmentVersion, KNOWLEDGE_VERSION } from './assessmentVersions.js'
import { MISSING } from './analytics.js'

// Historical records have no reliable common scoring contract. Count the stored
// observations; never apply today's answer key, levels or /26 denominator.
export function historicalRows(rows) {
  return rows.filter(row => assessmentVersion(row) !== KNOWLEDGE_VERSION)
}

function instrument(row) {
  const maximum = Number.isFinite(row.score_max) && row.score_max > 0 ? row.score_max : null
  const model = row.scoring_model || MISSING
  return { key: JSON.stringify([assessmentVersion(row), maximum, model]), maximum, model,
    label: `${maximum ? `Máximo registrado: ${maximum}` : 'Máximo não informado'} · modelo: ${model}` }
}

export function recordedCounts(rows, field) {
  const counts = new Map()
  for (const row of historicalRows(rows)) {
    const name = typeof row[field] === 'string' && row[field].trim() ? row[field] : MISSING
    counts.set(name, (counts.get(name) || 0) + 1)
  }
  return [...counts].map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'pt-BR'))
}

export function recordedScoreGroups(rows) {
  const groups = new Map()
  for (const row of historicalRows(rows)) {
    const { key, maximum, model, label } = instrument(row)
    if (!groups.has(key)) groups.set(key, { key, maximum, model, label, n: 0, missing: 0, counts: new Map() })
    const group = groups.get(key)
    group.n++
    if (!Number.isInteger(row.total_score) || row.total_score < 0 || (maximum !== null && row.total_score > maximum)) { group.missing++; continue }
    group.counts.set(row.total_score, (group.counts.get(row.total_score) || 0) + 1)
  }
  return [...groups.values()].map(({ counts, ...group }) => ({ ...group,
    rows: [...counts].sort(([a], [b]) => a - b).map(([score, value]) => ({ name: `${score} pontos`, score, value })),
  }))
}

export function recordedQuestions(answers, assessments) {
  const allowed = new Map(historicalRows(assessments).map(row => [row.id, instrument(row)]))
  const populations = new Map()
  for (const source of allowed.values()) populations.set(source.key, (populations.get(source.key) || 0) + 1)
  const grouped = new Map()
  for (const answer of answers) {
    if (!allowed.has(answer.assessment_id) || !Number.isInteger(answer.question_number) || answer.question_number < 1) continue
    // An assessment may only contribute once to a question. Duplicate or
    // conflicting stored answers are reported as missing, not double counted.
    const source = allowed.get(answer.assessment_id)
    const key = JSON.stringify([source.key, answer.question_number])
    if (!grouped.has(key)) grouped.set(key, { key, number: answer.question_number, source, people: new Map() })
    const people = grouped.get(key).people
    if (!people.has(answer.assessment_id)) people.set(answer.assessment_id, [])
    people.get(answer.assessment_id).push(answer)
  }
  return [...grouped.values()].sort((a, b) => a.number - b.number || a.key.localeCompare(b.key)).map(({ key, number, source, people }) => {
    const usable = [...people.values()].filter(list => list.length === 1 && /^[A-D]$/.test(list[0].selected_option)).map(list => list[0])
    const population = populations.get(source.key)
    return { key, number, name: `Q${number}`, instrument: source.label, population, n: usable.length, missing: population - usable.length,
      dimensions: [...new Set(usable.map(answer => answer.dimension || MISSING))].join(', '),
      rows: ['A', 'B', 'C', 'D'].map(option => ({ name: `Alternativa ${option}`, value: usable.filter(answer => answer.selected_option === option).length })),
    }
  })
}
