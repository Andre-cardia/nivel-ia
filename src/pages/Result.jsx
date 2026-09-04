import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { DIMENSION_LABELS, DIMENSION_MAX, MAX_SCORE } from '../lib/scoring'
import { buildAssessmentPayload, isAssessmentRetryDuplicate } from '../lib/assessmentPayload'
import { USAGE_OPTIONS } from '../data/questions'

const LEVEL_COLORS = {
  inicial:       'var(--muted)',
  basico:        'var(--accent)',
  intermediario: 'var(--green)',
  avancado:      '#a78bfa',
  estrategico:   '#f59e0b',
}

/**
 * Result Page — Conhecimento demonstrado e oportunidades de aprendizado
 * Implementa: Story 1.4 + envio Supabase (Story 2.2)
 */
export default function Result({ totalScore, level, dimensionScores, identification, openAnswer, toolsUsed, toolsOther, answers, survey }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [assessmentId] = useState(() => crypto.randomUUID())
  const accentColor = LEVEL_COLORS[level.key] || 'var(--accent)'

  async function handleSave() {
    if (saving || saved) return
    setSaving(true)
    setSaveError(null)
    try {
      const payload = buildAssessmentPayload({
        assessmentId,
        survey,
        identification,
        answers,
        openAnswer,
        toolsUsed,
        toolsOther,
      })
      // UUID gerado no cliente para não depender de SELECT após INSERT
      // (RLS bloqueia SELECT para usuários anônimos)
      const { error: assessmentError } = await supabase
        .from('assessments')
        .insert(payload)

      if (assessmentError && !isAssessmentRetryDuplicate(assessmentError, assessmentId)) throw assessmentError

      setSaved(true)
    } catch (err) {
      console.error('[supabase] save error:', err)
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="result-page">
      <div className="result-wrapper">
        {/* Header */}
        <div className="result-header animate-rise">
          <span className="eyebrow">Diagnóstico Concluído</span>
          <h1>Seu Resultado</h1>
          <p>
            {survey ? survey.company_name : identification.companyName}
            {identification.stakeholderRole ? ` · ${identification.stakeholderRole}` : ''}
            {identification.stakeholderDepartment ? ` · ${identification.stakeholderDepartment}` : ''}
          </p>
        </div>

        {/* Score card */}
        <div className="card result-score-card animate-rise" style={{ animationDelay: '80ms' }}>
          <p className="eyebrow" style={{ marginBottom: 'var(--s3)' }}>Acertos de conhecimento</p>
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
          <span className="eyebrow">Leitura do resultado</span>
          <p className="result-level-name" style={{ color: accentColor }}>{level.label}</p>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--muted)' }}>
            {level.description}
          </p>
          <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--text)' }}>
            Frequência de uso: {USAGE_OPTIONS[answers[1]] ?? 'Não informada'}
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

        {/* Save button */}
        <div className="animate-rise" style={{ animationDelay: '300ms', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s2)' }}>
          {!saved ? (
            <button
              id="btn-save-result"
              className="btn btn-outline"
              onClick={handleSave}
              disabled={saving}
              style={{ width: '100%', maxWidth: 320 }}
            >
              {saving ? 'Salvando...' : 'Confirmar e Salvar Resultado'}
            </button>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--green)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
              ✓ Resultado salvo com sucesso
            </p>
          )}
          {saveError && (
            <p style={{ textAlign: 'center', color: 'var(--error, #f87171)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
              Erro ao salvar. <button onClick={handleSave} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: 0 }}>Tentar novamente</button>
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
