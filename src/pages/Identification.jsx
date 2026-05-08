import { useState } from 'react'

/**
 * Identification Page — Formulário de empresa + stakeholder
 * Implementa: Story 1.1 AC3, AC4 e AC5
 */
export default function Identification({ onSubmit, survey }) {
  const [form, setForm] = useState({
    companyName: survey?.company_name || '',
    stakeholderName: '',
    stakeholderRole: '',
  })
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const newErrors = {}
    if (!form.companyName.trim()) newErrors.companyName = 'Nome da empresa é obrigatório.'
    if (!form.stakeholderName.trim()) newErrors.stakeholderName = 'Seu nome é obrigatório.'
    return newErrors
  }

  function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    onSubmit({
      companyName: form.companyName.trim(),
      stakeholderName: form.stakeholderName.trim(),
      stakeholderRole: form.stakeholderRole.trim(),
    })
  }

  return (
    <div className="id-page">
      <div className="id-form-wrapper">
        {/* Header */}
        <div className="id-header">
          <span className="eyebrow">Passo 1 de 2 — Identificação</span>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
            Sobre você e sua empresa
          </h1>
          <p style={{ maxWidth: 400, margin: '0 auto' }}>
            {survey ? (
              <>Você foi convidado(a) a responder este diagnóstico pela empresa <strong>{survey.company_name}</strong>. Por favor, identifique-se abaixo.</>
            ) : (
              <>Essas informações serão usadas para associar o resultado ao seu perfil executivo. Nenhum dado é compartilhado sem consentimento.</>
            )}
          </p>
        </div>

        <div className="divider" />

        {/* Form */}
        <form className="id-form" onSubmit={handleSubmit} noValidate>
          {/* Company Name */}
          <div className="input-group">
            <label className="input-label" htmlFor="companyName">
              Nome da Empresa <span className="required">*</span>
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              className={`input-field${errors.companyName ? ' has-error' : ''}`}
              placeholder="Ex: Acme Corp"
              value={form.companyName}
              onChange={handleChange}
              autoComplete="organization"
              autoFocus={!survey}
              disabled={!!survey}
              style={survey ? { background: 'var(--panel-2)', color: 'var(--muted)', cursor: 'not-allowed' } : {}}
            />
            {errors.companyName && (
              <span className="input-error" role="alert">{errors.companyName}</span>
            )}
          </div>

          {/* Stakeholder Name */}
          <div className="input-group">
            <label className="input-label" htmlFor="stakeholderName">
              Seu Nome <span className="required">*</span>
            </label>
            <input
              id="stakeholderName"
              name="stakeholderName"
              type="text"
              className={`input-field${errors.stakeholderName ? ' has-error' : ''}`}
              placeholder="Ex: João Silva"
              value={form.stakeholderName}
              onChange={handleChange}
              autoComplete="name"
            />
            {errors.stakeholderName && (
              <span className="input-error" role="alert">{errors.stakeholderName}</span>
            )}
          </div>

          {/* Role (optional) */}
          <div className="input-group">
            <label className="input-label" htmlFor="stakeholderRole">
              Cargo <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
            </label>
            <input
              id="stakeholderRole"
              name="stakeholderRole"
              type="text"
              className="input-field"
              placeholder="Ex: CEO, Diretor de Operações"
              value={form.stakeholderRole}
              onChange={handleChange}
              autoComplete="organization-title"
            />
          </div>

          <div className="id-form-footer">
            <button
              id="btn-submit-identification"
              type="submit"
              className="btn btn-primary w-full"
            >
              Iniciar Questionário →
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
