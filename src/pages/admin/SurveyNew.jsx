import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

/** Gera token legível: 8 chars alfanuméricos */
function generateToken() {
  return Math.random().toString(36).slice(2, 6) +
         Math.random().toString(36).slice(2, 6)
}

export default function SurveyNew() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    company_name: '',
    stakeholder_name: '',
    stakeholder_role: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(null) // survey criada

  function handleChange(e) {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.company_name.trim())    e.company_name    = 'Nome da empresa é obrigatório.'
    if (!form.stakeholder_name.trim()) e.stakeholder_name = 'Nome do stakeholder é obrigatório.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const token = generateToken()

    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('surveys')
      .insert({
        token,
        company_name:     form.company_name.trim(),
        stakeholder_name: form.stakeholder_name.trim(),
        stakeholder_role: form.stakeholder_role.trim() || null,
        created_by:       user?.id ?? null,
      })
      .select()
      .single()

    setLoading(false)
    if (error) { setErrors({ _server: error.message }); return }
    setCreated(data)
  }

  const surveyLink = created
    ? `${window.location.origin}/q/${created.token}`
    : ''

  if (created) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--s4)' }}>
        <div className="card card-success" style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 'var(--s6)', animation: 'rise 0.4s ease forwards' }}>
          <div>
            <span className="eyebrow text-green">Pesquisa Criada!</span>
            <h2 style={{ marginTop: 'var(--s2)' }}>{created.company_name}</h2>
            <p style={{ marginTop: 'var(--s1)' }}>Stakeholder: {created.stakeholder_name}{created.stakeholder_role ? ` · ${created.stakeholder_role}` : ''}</p>
          </div>

          <div className="divider" />

          <div>
            <p className="eyebrow" style={{ marginBottom: 'var(--s3)' }}>Link para os respondentes</p>
            <div style={{ display: 'flex', gap: 'var(--s2)', alignItems: 'center' }}>
              <input
                readOnly
                value={surveyLink}
                className="input-field"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', flex: 1 }}
                onClick={e => e.target.select()}
              />
              <button
                className="btn btn-outline"
                style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                onClick={() => {
                  navigator.clipboard.writeText(surveyLink)
                  alert('Link copiado!')
                }}
              >
                Copiar
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 'var(--s2)', fontFamily: 'var(--font-mono)' }}>
              Compartilhe este link com os funcionários de {created.company_name}.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--s3)' }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/admin/surveys')}>
              Ver todas as pesquisas
            </button>
            <button className="btn btn-outline" onClick={() => { setCreated(null); setForm({ company_name: '', stakeholder_name: '', stakeholder_role: '' }) }}>
              Nova pesquisa
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--s4)' }}>
      <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 'var(--s6)', animation: 'rise 0.4s ease forwards' }}>
        <div>
          <button className="btn btn-outline" style={{ marginBottom: 'var(--s5)', fontSize: '0.8rem' }} onClick={() => navigate('/admin/surveys')}>
            ← Voltar
          </button>
          <span className="eyebrow">Nova Pesquisa</span>
          <h2 style={{ marginTop: 'var(--s2)' }}>Cadastrar empresa</h2>
          <p style={{ marginTop: 'var(--s1)' }}>Após criar, você receberá um link único para compartilhar com os funcionários da empresa.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s5)' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="company_name">
                Nome da Empresa <span className="required">*</span>
              </label>
              <input
                id="company_name" name="company_name" type="text"
                className={`input-field${errors.company_name ? ' has-error' : ''}`}
                placeholder="Ex: Acme Corp"
                value={form.company_name}
                onChange={handleChange}
                autoFocus
              />
              {errors.company_name && <span className="input-error">{errors.company_name}</span>}
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="stakeholder_name">
                Nome do Stakeholder <span className="required">*</span>
              </label>
              <input
                id="stakeholder_name" name="stakeholder_name" type="text"
                className={`input-field${errors.stakeholder_name ? ' has-error' : ''}`}
                placeholder="Ex: João Silva"
                value={form.stakeholder_name}
                onChange={handleChange}
              />
              {errors.stakeholder_name && <span className="input-error">{errors.stakeholder_name}</span>}
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="stakeholder_role">
                Cargo do Stakeholder <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
              </label>
              <input
                id="stakeholder_role" name="stakeholder_role" type="text"
                className="input-field"
                placeholder="Ex: CEO, Diretor de Inovação"
                value={form.stakeholder_role}
                onChange={handleChange}
              />
            </div>

            {errors._server && (
              <p style={{ color: 'var(--error)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{errors._server}</p>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Pesquisa e Gerar Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
