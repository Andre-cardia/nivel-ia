import { Fragment, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { LEVELS, DIMENSION_LABELS, DIMENSION_MAX } from '../../lib/scoring'

const LEVEL_COLORS = {
  inicial: 'var(--muted)',
  basico: 'var(--accent)',
  intermediario: 'var(--green)',
  avancado: '#a78bfa',
}

function levelLabel(key) {
  return LEVELS.find(l => l.key === key)?.label ?? key
}

const LEVEL_ORDER_MAP = { inicial: 0, basico: 1, intermediario: 2, avancado: 3, estrategico: 4 }

function sortedAssessments(list, col, dir) {
  const mult = dir === 'asc' ? 1 : -1
  return [...list].sort((a, b) => {
    if (col === 'date')  return mult * a.created_at.localeCompare(b.created_at)
    if (col === 'name')  return mult * (a.respondent_name || '').toLowerCase().localeCompare((b.respondent_name || '').toLowerCase())
    if (col === 'role')  return mult * (a.respondent_role || '').toLowerCase().localeCompare((b.respondent_role || '').toLowerCase())
    if (col === 'dept')  return mult * (a.respondent_department || '').toLowerCase().localeCompare((b.respondent_department || '').toLowerCase())
    if (col === 'score') return mult * (a.total_score - b.total_score)
    if (col === 'level') return mult * ((LEVEL_ORDER_MAP[a.level] ?? 0) - (LEVEL_ORDER_MAP[b.level] ?? 0))
    return 0
  })
}

function SortTh({ col, label, sortCol, sortDir, onSort }) {
  const active = sortCol === col
  return (
    <th onClick={() => onSort(col)} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
      {label}
      <span style={{ marginLeft: 4, opacity: active ? 1 : 0.3, fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
        {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </th>
  )
}

export default function SurveyDetail({ onSignOut }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [survey, setSurvey] = useState(null)
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [dimScores, setDimScores] = useState({})
  const [deletingId, setDeletingId] = useState(null)
  const [sortCol, setSortCol] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  useEffect(() => {
    async function load() {
      const [{ data: sv }, { data: as }] = await Promise.all([
        supabase.from('surveys').select('*').eq('id', id).single(),
        supabase.from('assessments').select('*').eq('survey_id', id).order('created_at', { ascending: false }),
      ])
      setSurvey(sv)
      setAssessments(as ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  async function loadDim(aId) {
    if (dimScores[aId]) { setSelected(aId); return }
    const { data } = await supabase
      .from('assessment_answers')
      .select('dimension, score')
      .eq('assessment_id', aId)
    if (data) {
      const agg = data.reduce((acc, r) => { acc[r.dimension] = (acc[r.dimension] ?? 0) + r.score; return acc }, {})
      setDimScores(p => ({ ...p, [aId]: agg }))
    }
    setSelected(aId)
  }

  async function deleteAssessment(assessment) {
    if (!window.confirm('Excluir este respondente anônimo?\n\nTodas as respostas serão removidas permanentemente.')) return
    setDeletingId(assessment.id)
    if (selected === assessment.id) setSelected(null)
    const { error } = await supabase.from('assessments').delete().eq('id', assessment.id)
    if (!error) setAssessments(prev => prev.filter(a => a.id !== assessment.id))
    setDeletingId(null)
  }

  const maxScore = LEVELS[LEVELS.length - 1].max

  const avgScore = assessments.length
    ? Math.round(assessments.reduce((s, a) => s + a.total_score, 0) / assessments.length)
    : null

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner spinner-lg" />
    </div>
  )

  if (!survey) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--muted)' }}>Pesquisa não encontrada.</p>
    </div>
  )

  const surveyLink = `${window.location.origin}/q/${survey.token}`

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ marginBottom: 'var(--s6)' }}>
          <div className="brand-logo">
            <div className="brand-logo-icon">N</div>
            <span className="brand-logo-text">Nível IA</span>
          </div>
        </div>
        <span className="eyebrow" style={{ color: 'var(--muted)' }}>Admin</span>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)', marginTop: 'var(--s3)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)', cursor: 'pointer' }} onClick={() => navigate('/admin')}>Dashboard</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)', cursor: 'pointer' }} onClick={() => navigate('/admin/surveys')}>Pesquisas</span>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <button className="btn btn-outline w-full" onClick={onSignOut} style={{ fontSize: '0.8rem' }}>Sair</button>
        </div>
      </aside>

      <main className="admin-main">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s8)' }}>

          {/* Header */}
          <div>
            <div style={{ display: 'flex', gap: 'var(--s3)', marginBottom: 'var(--s4)' }}>
              <button className="btn btn-outline" style={{ fontSize: '0.8rem' }} onClick={() => navigate('/admin/surveys')}>
                ← Pesquisas
              </button>
              <button className="btn btn-outline" style={{ fontSize: '0.8rem' }} onClick={() => navigate(`/admin/surveys/${id}/analytics`)}>
                Analytics →
              </button>
            </div>
            <span className="eyebrow">{survey.is_active ? '● Ativa' : '○ Inativa'}</span>
            <h1 style={{ fontSize: '1.5rem', marginTop: 'var(--s2)' }}>{survey.company_name}</h1>
            <p style={{ marginTop: 'var(--s1)' }}>
              Stakeholder: {survey.stakeholder_name}{survey.stakeholder_role ? ` · ${survey.stakeholder_role}` : ''}
            </p>
            <div style={{ marginTop: 'var(--s4)', display: 'flex', gap: 'var(--s2)', alignItems: 'center' }}>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent)', background: 'var(--accent-soft)', padding: '4px 10px', borderRadius: 4 }}>
                {surveyLink}
              </code>
              <button
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', minHeight: 32 }}
                onClick={() => navigator.clipboard.writeText(surveyLink).then(() => alert('Link copiado!'))}
              >
                Copiar link
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--s4)' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>Respondentes</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>
                {assessments.length}
              </p>
            </div>
            {avgScore !== null && (
              <div className="card" style={{ textAlign: 'center' }}>
                <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>Média da Empresa</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>
                  {avgScore}<span style={{ fontSize: '1rem', color: 'var(--muted)' }}>/{maxScore}</span>
                </p>
              </div>
            )}
          </div>

          {/* Respondents table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 'var(--s5) var(--s6)', borderBottom: '1px solid var(--line)' }}>
              <span className="eyebrow">Respondentes</span>
            </div>

            {assessments.length === 0 ? (
              <p style={{ padding: 'var(--s8)', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
                Nenhuma resposta coletada ainda. Compartilhe o link acima!
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <SortTh col="date"  label="Data"         sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                      <SortTh col="name"  label="Nome"         sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                      <SortTh col="role"  label="Cargo"        sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                      <SortTh col="dept"  label="Departamento" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                      <SortTh col="score" label="Pontuação"    sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                      <SortTh col="level" label="Nível"        sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAssessments(assessments, sortCol, sortDir).map(a => (
                      <Fragment key={a.id}>
                        <tr style={{ opacity: deletingId === a.id ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                          <td className="mono-data">{new Date(a.created_at).toLocaleDateString('pt-BR')}</td>
                          <td style={{ color: 'var(--text)', fontSize: '0.8rem' }}>{a.respondent_name || '—'}</td>
                          <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{a.respondent_role || '—'}</td>
                          <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{a.respondent_department || '—'}</td>
                          <td className="mono-data">
                            <span style={{ color: 'var(--accent)' }}>{a.total_score}</span>
                            <span style={{ color: 'var(--muted)' }}>/{maxScore}</span>
                          </td>
                          <td>
                            <span className="badge" style={{ background: 'transparent', color: LEVEL_COLORS[a.level], border: `1px solid ${LEVEL_COLORS[a.level]}40` }}>
                              {levelLabel(a.level)}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 'var(--s2)' }}>
                              <button
                                className="btn btn-outline"
                                style={{ fontSize: '0.7rem', minHeight: 30, padding: '0 12px' }}
                                onClick={() => selected === a.id ? setSelected(null) : loadDim(a.id)}
                              >
                                {selected === a.id ? 'Fechar' : 'Ver'}
                              </button>
                              <button
                                className="btn btn-outline"
                                style={{ fontSize: '0.7rem', minHeight: 30, padding: '0 12px', color: 'var(--error)' }}
                                onClick={() => deleteAssessment(a)}
                                disabled={deletingId === a.id}
                              >
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                        {selected === a.id && dimScores[a.id] && (
                          <tr>
                            <td colSpan={7} style={{ background: 'var(--panel-2)', padding: 'var(--s5) var(--s6)' }}>
                              <p className="eyebrow" style={{ marginBottom: 'var(--s4)' }}>Pontuação por Dimensão</p>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--s4)' }}>
                                {Object.entries(dimScores[a.id]).map(([dim, score]) => {
                                  const max = DIMENSION_MAX[dim] ?? 3
                                  return (
                                    <div key={dim}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text)' }}>{DIMENSION_LABELS[dim] ?? dim}</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent)' }}>{score}/{max}</span>
                                      </div>
                                      <div className="progress-bar-track">
                                        <div className="progress-bar-fill" style={{ width: `${Math.round(score / max * 100)}%` }} />
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                              <div style={{ marginTop: 'var(--s5)', paddingTop: 'var(--s4)', borderTop: '1px solid var(--line)' }}>
                                <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>Ferramentas de IA utilizadas</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                                  {a.tools_used?.length ? a.tools_used.join(', ') : 'Nenhuma informada'}
                                </p>
                              </div>
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
