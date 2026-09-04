import { useState } from 'react'

/**
 * @param {{
 *   onSubmit: (data: { companyName: string, stakeholderName: string, stakeholderRole: string, stakeholderDepartment: string }) => void,
 *   survey?: { company_name: string } | null,
 * }} props
 */
export default function Identification({ onSubmit, survey }) {
  const [form, setForm] = useState({
    companyName: survey?.company_name || '',
    firstName: '',
    lastName: '',
    stakeholderRole: '',
    stakeholderDepartment: '',
  })
  const [errors, setErrors] = useState(/** @type {Record<string, string>} */ ({}))

  /** @param {import('react').ChangeEvent<HTMLInputElement>} e */
  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validate() {
    /** @type {Record<string, string>} */
    const newErrors = {}
    if (!survey && !form.companyName.trim()) newErrors.companyName = 'Nome da empresa é obrigatório.'
    return newErrors
  }

  /** @param {import('react').FormEvent<HTMLFormElement>} e */
  function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    const fullName = [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(' ')
    onSubmit({
      companyName: form.companyName.trim(),
      stakeholderName: fullName,
      stakeholderRole: form.stakeholderRole.trim(),
      stakeholderDepartment: form.stakeholderDepartment.trim(),
    })
  }

  return (
    <div className="id-page">
      <div className="id-form-wrapper">
        <div className="id-header">
          <span className="eyebrow">Identificação</span>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
            {survey
              ? `Você foi convidado(a) a responder o diagnóstico da ${survey.company_name}`
              : 'Sobre você e sua empresa'}
          </h1>
          <p style={{ maxWidth: 400, margin: '0 auto' }}>
            {survey
              ? 'Preencha seus dados antes de iniciar.'
              : 'Informe o nome da empresa e seus dados para associar o resultado.'
            }
          </p>
        </div>

        <div className="divider" />

        <form className="id-form" onSubmit={handleSubmit} noValidate>

          {/* Empresa — só no fluxo sem survey */}
          {!survey && (
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
                autoFocus
              />
              {errors.companyName && (
                <span className="input-error" role="alert">{errors.companyName}</span>
              )}
            </div>
          )}

          {/* Nome e Sobrenome */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="firstName">
                Nome <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="input-field"
                placeholder="Ex: João"
                value={form.firstName}
                onChange={handleChange}
                autoComplete="given-name"
                autoFocus={!!survey}
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="lastName">
                Sobrenome <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="input-field"
                placeholder="Ex: Silva"
                value={form.lastName}
                onChange={handleChange}
                autoComplete="family-name"
              />
            </div>
          </div>

          {/* Cargo */}
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

          {/* Departamento */}
          <div className="input-group">
            <label className="input-label" htmlFor="stakeholderDepartment">
              Departamento <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
            </label>
            <input
              id="stakeholderDepartment"
              name="stakeholderDepartment"
              type="text"
              className="input-field"
              placeholder="Ex: Comercial, Tecnologia, RH"
              value={form.stakeholderDepartment}
              onChange={handleChange}
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
