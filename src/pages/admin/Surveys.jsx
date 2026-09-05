import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Surveys({ onSignOut }) {
  const navigate = useNavigate()
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setSurveys(data ?? [])
        setLoading(false)
      })
  }, [])

  async function toggleActive(survey) {
    await supabase.from('surveys').update({ is_active: !survey.is_active }).eq('id', survey.id)
    setSurveys(prev => prev.map(s => s.id === survey.id ? { ...s, is_active: !s.is_active } : s))
  }

  function startEdit(survey) {
    setEditingId(survey.id)
    setEditName(survey.company_name)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
  }

  async function saveEdit(id) {
    const name = editName.trim()
    if (!name) return
    setSavingId(id)
    const { error } = await supabase.from('surveys').update({ company_name: name }).eq('id', id)
    if (!error) {
      setSurveys(prev => prev.map(s => s.id === id ? { ...s, company_name: name } : s))
      setEditingId(null)
    }
    setSavingId(null)
  }

  async function deleteSurvey(survey) {
    if (!window.confirm(`Excluir a empresa "${survey.company_name}"?\n\nTodos os respondentes e respostas serão removidos permanentemente.`)) return
    setDeletingId(survey.id)
    const { error } = await supabase.from('surveys').delete().eq('id', survey.id)
    if (!error) setSurveys(prev => prev.filter(s => s.id !== survey.id))
    setDeletingId(null)
  }

  const surveyLink = (token) => `${window.location.origin}/q/${token}`

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
          <span
            style={{ fontSize: '0.85rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
            onClick={() => navigate('/admin')}
          >
            Dashboard
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text)', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
            Pesquisas
          </span>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <button className="btn btn-outline w-full" onClick={onSignOut} style={{ fontSize: '0.8rem' }}>Sair</button>
        </div>
      </aside>

      <main className="admin-main">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s8)' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--s4)' }}>
            <div>
              <span className="eyebrow">Pesquisas por Empresa</span>
              <h1 style={{ fontSize: '1.5rem', marginTop: 'var(--s2)' }}>Pesquisas Cadastradas</h1>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/admin/surveys/new')}>
              + Nova Pesquisa
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 'var(--s5) var(--s6)', borderBottom: '1px solid var(--line)' }}>
              <span className="eyebrow">Empresas cadastradas</span>
            </div>

            {loading && (
              <div style={{ padding: 'var(--s8)', textAlign: 'center' }}>
                <div className="spinner spinner-md" style={{ margin: '0 auto' }} />
              </div>
            )}

            {!loading && surveys.length === 0 && (
              <div style={{ padding: 'var(--s12)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--s4)', alignItems: 'center' }}>
                <p style={{ color: 'var(--muted)' }}>Nenhuma pesquisa cadastrada ainda.</p>
                <button className="btn btn-primary" onClick={() => navigate('/admin/surveys/new')}>
                  Criar primeira pesquisa
                </button>
              </div>
            )}

            {!loading && surveys.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Empresa</th>
                      <th>Stakeholder</th>
                      <th>Link</th>
                      <th>Status</th>
                      <th>Data</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {surveys.map(s => (
                      <tr key={s.id} style={{ opacity: deletingId === s.id ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                        <td style={{ fontWeight: 600, minWidth: 160 }}>
                          {editingId === s.id ? (
                            <div style={{ display: 'flex', gap: 'var(--s2)', alignItems: 'center' }}>
                              <input
                                className="input-field"
                                style={{ fontSize: '0.85rem', minHeight: 32, padding: '4px 10px', width: 180 }}
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') saveEdit(s.id); if (e.key === 'Escape') cancelEdit() }}
                                autoFocus
                              />
                              <button
                                className="btn btn-primary"
                                style={{ fontSize: '0.65rem', minHeight: 28, padding: '0 10px' }}
                                onClick={() => saveEdit(s.id)}
                                disabled={savingId === s.id}
                              >
                                {savingId === s.id ? '…' : 'Salvar'}
                              </button>
                              <button
                                className="btn btn-outline"
                                style={{ fontSize: '0.65rem', minHeight: 28, padding: '0 8px' }}
                                onClick={cancelEdit}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <span
                              title="Clique para editar"
                              style={{ cursor: 'pointer' }}
                              onClick={() => startEdit(s)}
                            >
                              {s.company_name}
                            </span>
                          )}
                          <p className="eyebrow" style={{ marginTop: 6 }}>{s.application_phase === 'final' ? 'Aplicação final' : 'Diagnóstico inicial'}</p>
                        </td>
                        <td>
                          <span>{s.stakeholder_name}</span>
                          {s.stakeholder_role && <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)' }}>{s.stakeholder_role}</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 'var(--s2)', alignItems: 'center' }}>
                            <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)', background: 'var(--accent-soft)', padding: '2px 6px', borderRadius: 3 }}>
                              /q/{s.token}
                            </code>
                            <button
                              className="btn btn-outline"
                              style={{ fontSize: '0.65rem', minHeight: 26, padding: '0 8px' }}
                              onClick={() => navigator.clipboard.writeText(surveyLink(s.token)).then(() => alert('Link copiado!'))}
                            >
                              Copiar
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${s.is_active ? 'badge-green' : ''}`} style={!s.is_active ? { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--line)' } : {}}>
                            {s.is_active ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                        <td className="mono-data" style={{ fontSize: '0.75rem' }}>
                          {new Date(s.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 'var(--s2)', flexWrap: 'wrap' }}>
                            <button
                              className="btn btn-outline"
                              style={{ fontSize: '0.7rem', minHeight: 30, padding: '0 12px' }}
                              onClick={() => navigate(`/admin/surveys/${s.id}`)}
                            >
                              Ver
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{ fontSize: '0.7rem', minHeight: 30, padding: '0 12px', color: s.is_active ? 'var(--muted)' : 'var(--green)' }}
                              onClick={() => toggleActive(s)}
                            >
                              {s.is_active ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{ fontSize: '0.7rem', minHeight: 30, padding: '0 12px', color: 'var(--error)' }}
                              onClick={() => deleteSurvey(s)}
                              disabled={deletingId === s.id}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
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
