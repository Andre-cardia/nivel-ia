import { Fragment, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { LEVELS, DIMENSION_LABELS } from '../../lib/scoring'

const LEVEL_COLORS = {
  inicial:       'var(--muted)',
  basico:        'var(--accent)',
  intermediario: 'var(--green)',
  avancado:      '#a78bfa',
}

function levelLabel(key) {
  return LEVELS.find(l => l.key === key)?.label ?? key
}

export default function AdminDashboard({ onSignOut }) {
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [dimScores, setDimScores] = useState({})

  useEffect(() => {
    supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setAssessments(data ?? [])
        setLoading(false)
      })
  }, [])

  async function loadDimScores(id) {
    if (dimScores[id]) { setSelected(id); return }
    const { data } = await supabase
      .from('assessment_answers')
      .select('dimension, score')
      .eq('assessment_id', id)
    if (data) {
      const agg = data.reduce((acc, row) => {
        acc[row.dimension] = (acc[row.dimension] ?? 0) + row.score
        return acc
      }, {})
      setDimScores(prev => ({ ...prev, [id]: agg }))
    }
    setSelected(id)
  }

  const avgScore = assessments.length
    ? Math.round(assessments.reduce((s, a) => s + a.total_score, 0) / assessments.length)
    : 0

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div style={{ marginBottom: 'var(--s6)' }}>
          <div className="brand-logo">
            <div className="brand-logo-icon">N</div>
            <span className="brand-logo-text">Nível IA</span>
          </div>
        </div>
        <span className="eyebrow" style={{ color: 'var(--muted)' }}>Admin</span>
        <nav style={{ marginTop: 'var(--s3)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>Dashboard</span>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <button className="btn btn-outline w-full" onClick={onSignOut} style={{ fontSize: '0.8rem' }}>Sair</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s8)' }}>

          <div>
            <span className="eyebrow">Visão Geral</span>
            <h1 style={{ fontSize: '1.5rem', marginTop: 'var(--s2)' }}>Diagnósticos Coletados</h1>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--s4)' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>Total</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>
                {assessments.length}
              </p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>Média Geral</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>
                {avgScore}<span style={{ fontSize: '1rem', color: 'var(--muted)' }}>/75</span>
              </p>
            </div>
          </div>

          {/* Table — Story 3.2 */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 'var(--s5) var(--s6)', borderBottom: '1px solid var(--line)' }}>
              <span className="eyebrow">Respondentes</span>
            </div>

            {loading && (
              <div style={{ padding: 'var(--s8)', textAlign: 'center' }}>
                <div className="spinner spinner-md" style={{ margin: '0 auto' }} />
              </div>
            )}

            {!loading && assessments.length === 0 && (
              <p style={{ padding: 'var(--s8)', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
                Nenhum diagnóstico coletado ainda.
              </p>
            )}

            {!loading && assessments.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Empresa</th>
                      <th>Stakeholder</th>
                      <th>Cargo</th>
                      <th>Pontuação</th>
                      <th>Nível</th>
                      <th>Detalhe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map(a => (
                      <Fragment key={a.id}>
                        {/* Main row */}
                        <tr>
                          <td className="mono-data">{new Date(a.created_at).toLocaleDateString('pt-BR')}</td>
                          <td>{a.company_name}</td>
                          <td>{a.stakeholder_name}</td>
                          <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{a.stakeholder_role || '—'}</td>
                          <td className="mono-data">
                            <span style={{ color: 'var(--accent)' }}>{a.total_score}</span>
                            <span style={{ color: 'var(--muted)' }}>/75</span>
                          </td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                background: 'transparent',
                                color: LEVEL_COLORS[a.level],
                                border: `1px solid ${LEVEL_COLORS[a.level]}40`,
                              }}
                            >
                              {levelLabel(a.level)}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-outline"
                              style={{ fontSize: '0.7rem', minHeight: 30, padding: '0 12px' }}
                              onClick={() => selected === a.id ? setSelected(null) : loadDimScores(a.id)}
                            >
                              {selected === a.id ? 'Fechar' : 'Ver'}
                            </button>
                          </td>
                        </tr>

                        {/* Dimension breakdown row — Story 3.3 */}
                        {selected === a.id && dimScores[a.id] && (
                          <tr>
                            <td colSpan={7} style={{ background: 'var(--panel-2)', padding: 'var(--s5) var(--s6)' }}>
                              <p className="eyebrow" style={{ marginBottom: 'var(--s4)' }}>Por Dimensão</p>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--s4)' }}>
                                {Object.entries(dimScores[a.id]).map(([dim, score]) => {
                                  const max = dim === 'maturidade_executiva' ? 12 : 9
                                  const pct = Math.round((score / max) * 100)
                                  return (
                                    <div key={dim}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text)' }}>{DIMENSION_LABELS[dim] ?? dim}</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent)' }}>{score}/{max}</span>
                                      </div>
                                      <div className="progress-bar-track">
                                        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                              {a.open_answer && (
                                <div style={{ marginTop: 'var(--s5)', paddingTop: 'var(--s4)', borderTop: '1px solid var(--line)' }}>
                                  <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>Resposta Aberta</p>
                                  <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.6 }}>{a.open_answer}</p>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
