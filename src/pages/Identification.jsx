import { useState } from 'react'

export default function Identification({ onSubmit, survey }) {
  const [form, setForm] = useState({
    companyName: survey?.company_name || '',
    stakeholderName: '',
    stakeholderRole: '',
    stakeholderDepartment: '',
  })
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const newErrors = {}
    if (!survey && !form.companyName.trim()) newErrors.companyName = 'Nome da empresa é obrigatório.'
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
      stakeholderName: '',
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
              ? 'Preencha seu cargo e departamento antes de iniciar.'
              : 'Informe o nome da empresa e seu cargo para associar o resultado.'
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
              autoFocus={!!survey}
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
