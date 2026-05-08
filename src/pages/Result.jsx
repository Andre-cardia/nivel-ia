import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { DIMENSION_LABELS, DIMENSION_MAX, MAX_SCORE } from '../lib/scoring'

const LEVEL_COLORS = {
  inicial:       'var(--muted)',
  basico:        'var(--accent)',
  intermediario: 'var(--green)',
  avancado:      '#a78bfa',
}

/**
 * Result Page — Resultado, nível, recomendações e CTA
 * Implementa: Story 1.4 + envio Supabase (Story 2.2)
 */
export default function Result({ totalScore, level, dimensionScores, identification, openAnswer, onRestart, survey }) {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const accentColor = LEVEL_COLORS[level.key] || 'var(--accent)'

  useEffect(() => {
    async function saveAssessment() {
      setSaving(true)
      try {
        const { data: assessment, error: assessmentError } = await supabase
          .from('assessments')
          .insert({
            survey_id: survey?.id || null,
            company_name: survey ? survey.company_name : identification.companyName,
            stakeholder_name: survey ? survey.stakeholder_name : identification.stakeholderName,
            stakeholder_role: survey ? survey.stakeholder_role : (identification.stakeholderRole || null),
            respondent_name: survey ? identification.stakeholderName : null,
            respondent_role: survey ? (identification.stakeholderRole || null) : null,
            respondent_department: identification.stakeholderDepartment || null,
            total_score: totalScore,
            level: level.key,
            open_answer: openAnswer || null,
          })
          .select()
          .single()

        if (assessmentError) throw assessmentError

        // Insert dimension scores as individual answer rows (simplified: one row per dimension)
        const dimensionRows = Object.entries(dimensionScores).map(([dim, score]) => ({
          assessment_id: assessment.id,
          question_number: 0,
          dimension: dim,
          selected_option: '-',
          score,
        }))

        const { error: dimError } = await supabase
          .from('assessment_answers')
          .insert(dimensionRows)

        if (dimError) console.warn('[supabase] dimension insert error:', dimError)
      } catch (err) {
        console.error('[supabase] save error:', err)
        setSaveError(err.message)
      } finally {
        setSaving(false)
      }
    }

    saveAssessment()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="result-page">
      <div className="result-wrapper">
        {/* Header */}
        <div className="result-header animate-rise">
          <span className="eyebrow">Diagnóstico Concluído</span>
          <h1>Seu Resultado</h1>
          <p>
            {identification.stakeholderName} · {identification.companyName}
            {identification.stakeholderRole ? ` · ${identification.stakeholderRole}` : ''}
          </p>
        </div>

        {/* Score card */}
        <div className="card result-score-card animate-rise" style={{ animationDelay: '80ms' }}>
          <p className="eyebrow" style={{ marginBottom: 'var(--s3)' }}>Pontuação Total</p>
          <div className="metric-display">
            {totalScore}
            <span className="metric-total">/ {MAX_SCORE}</span>
          </div>
        </div>

        {/* Level card */}
        <div
          className="card card-accent result-level-card animate-rise"
          style={{ animationDelay: '160ms', borderTopColor: accentColor }}
        >
          <span className="eyebrow">Nível Alcançado</span>
          <p className="result-level-name" style={{ color: accentColor }}>{level.label}</p>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--muted)' }}>
            {level.description}
          </p>
          <div style={{ marginTop: 'var(--s4)', paddingTop: 'var(--s4)', borderTop: '1px solid var(--line)' }}>
            <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>Recomendação</p>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text)' }}>
              {level.recommendation}
            </p>
          </div>
        </div>

        {/* Dimension breakdown */}
        <div className="card animate-rise" style={{ animationDelay: '240ms' }}>
          <p className="eyebrow" style={{ marginBottom: 'var(--s5)' }}>Por Dimensão</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
            {Object.entries(dimensionScores).map(([dim, score]) => {
              const max = DIMENSION_MAX[dim]
              const pct = Math.round((score / max) * 100)
              return (
                <div key={dim}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>
                      {DIMENSION_LABELS[dim]}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)' }}>
                      {score}/{max}
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Saving indicator */}
        {saving && (
          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            Salvando resultado...
          </p>
        )}
        {saveError && (
          <p style={{ textAlign: 'center', color: 'var(--error)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            Não foi possível salvar o resultado no servidor.
          </p>
        )}

        {/* CTAs */}
        <div className="result-cta animate-rise" style={{ animationDelay: '320ms', display: 'flex', flexDirection: 'column', gap: 'var(--s3)', alignItems: 'center' }}>
          <a
            id="btn-cta-training"
            href="https://mentoria.neuralhub.ia.br"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ width: '100%', maxWidth: 320 }}
          >
            Explorar Treinamentos
          </a>
          <button
            id="btn-restart-quiz"
            className="btn btn-outline"
            onClick={onRestart}
            style={{ maxWidth: 320, width: '100%' }}
          >
            Refazer Diagnóstico
          </button>
        </div>
      </div>
    </div>
  )
}
