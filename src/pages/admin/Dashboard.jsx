import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { averageKnowledgeScore, KNOWLEDGE_MAX } from '../../lib/assessmentVersions'
import { deleteSurveyWithResponses } from '../../lib/deleteSurvey'

export default function AdminDashboard({ onSignOut }) {
  const navigate = useNavigate()
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    supabase
      .from('surveys')
      .select('*, assessments(total_score, questionnaire_version, scoring_model, score_max)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setSurveys(data.map(s => ({
            ...s,
            respondent_count: s.assessments.length,
            avg_score: averageKnowledgeScore(s.assessments),
          })))
        }
        setLoading(false)
      })
  }, [])

  async function deleteSurvey(survey) {
    const respondents = survey.respondent_count
    const respondentText = respondents === 1
      ? '1 respondente e todas as suas respostas'
      : `${respondents} respondentes e todas as suas respostas`
    const confirmed = window.confirm(
      `Excluir permanentemente a pesquisa “${survey.company_name}”?\n\n` +
      `O link, ${respondentText} serão apagados. Esta ação não pode ser desfeita.`,
    )
    if (!confirmed) return

    setDeleteError(null)
    setDeletingId(survey.id)

    try {
      await deleteSurveyWithResponses(supabase, survey.id)
      setSurveys(previous => previous.filter(item => item.id !== survey.id))
    } catch (error) {
      console.error('Failed to delete survey', error)
      setDeleteError('Não foi possível excluir a pesquisa. Tente novamente.')
    } finally {
      setDeletingId(null)
    }
  }

  const totalRespondents = surveys.reduce((sum, s) => sum + s.respondent_count, 0)
  const activeSurveys = surveys.filter(s => s.is_active).length

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
        <nav style={{ marginTop: 'var(--s3)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
            Dashboard
          </span>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <button className="btn btn-outline w-full" onClick={onSignOut} style={{ fontSize: '0.8rem' }}>Sair</button>
        </div>
      </aside>

      <main className="admin-main">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s8)' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--s4)' }}>
            <div>
              <span className="eyebrow">Painel Administrativo</span>
              <h1 style={{ fontSize: '1.5rem', marginTop: 'var(--s2)' }}>Empresas Cadastradas</h1>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/admin/surveys/new')}>
              + Nova Pesquisa
            </button>
          </div>

          {/* Stats bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--s4)' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>Empresas</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>
                {surveys.length}
              </p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>Ativas</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--green)' }}>
                {activeSurveys}
              </p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>Respondentes</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>
                {totalRespondents}
              </p>
            </div>
          </div>

          {/* Survey cards */}
          {loading && (
            <div style={{ padding: 'var(--s8)', textAlign: 'center' }}>
              <div className="spinner spinner-md" style={{ margin: '0 auto' }} />
            </div>
          )}

          {!loading && surveys.length === 0 && (
            <div className="card" style={{ padding: 'var(--s12)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--s4)', alignItems: 'center' }}>
              <p style={{ color: 'var(--muted)' }}>Nenhuma empresa cadastrada ainda.</p>
              <button className="btn btn-primary" onClick={() => navigate('/admin/surveys/new')}>
                Cadastrar primeira empresa
              </button>
            </div>
          )}

          {!loading && surveys.length > 0 && (
            <>
              {deleteError && (
                <p role="alert" style={{ color: 'var(--error)', fontSize: '0.875rem' }}>
                  {deleteError}
                </p>
              )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--s4)' }}>
              {surveys.map(s => (
                <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)', opacity: deletingId === s.id ? 0.5 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '1rem' }}>{s.company_name}</p>
                      <span className="eyebrow">{s.application_phase === 'final' ? 'Aplicação final' : 'Diagnóstico inicial'}</span>
                      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 'var(--s1)' }}>
                        {s.stakeholder_name}{s.stakeholder_role ? ` · ${s.stakeholder_role}` : ''}
                      </p>
                    </div>
                    <span
                      className={`badge ${s.is_active ? 'badge-green' : ''}`}
                      style={!s.is_active ? { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--line)' } : {}}
                    >
                      {s.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  <div className="divider" />

                  <div style={{ display: 'flex', gap: 'var(--s6)' }}>
                    <div>
                      <p className="eyebrow" style={{ marginBottom: 'var(--s1)' }}>Respondentes</p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>
                        {s.respondent_count}
                      </p>
                    </div>
                    {s.avg_score !== null && (
                      <div>
                        <p className="eyebrow" style={{ marginBottom: 'var(--s1)' }}>Média · Conhecimento v2</p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>
                          {s.avg_score.toFixed(1)}<span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>/{KNOWLEDGE_MAX}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--s2)', marginTop: 'auto' }}>
                    <button
                      className="btn btn-outline w-full"
                      style={{ fontSize: '0.8rem' }}
                      onClick={() => navigate(`/admin/surveys/${s.id}`)}
                      disabled={deletingId === s.id}
                    >
                      Ver detalhes
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', color: 'var(--error)' }}
                      onClick={() => deleteSurvey(s)}
                      disabled={deletingId === s.id}
                    >
                      {deletingId === s.id ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            </>
          )}

        </div>
      </main>
    </div>
  )
}
