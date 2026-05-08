import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

/**
 * Admin Login — Story 3.1
 */
export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      navigate('/admin')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 'var(--s4)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 'var(--s5)', animation: 'rise 0.4s ease forwards' }}>
        <div>
          <span className="eyebrow">Acesso Restrito</span>
          <h2 style={{ marginTop: 'var(--s2)' }}>Painel Admin</h2>
          <p style={{ fontSize: '0.85rem', marginTop: 'var(--s1)' }}>Nível IA — Diagnóstico Executivo</p>
        </div>

        <div className="divider" />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="admin-email">E-mail</label>
            <input
              id="admin-email"
              type="email"
              className="input-field"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              autoComplete="email"
              required
              autoFocus
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="admin-password">Senha</label>
            <input
              id="admin-password"
              type="password"
              className="input-field"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p style={{ color: 'var(--error)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{error}</p>}
          <button id="btn-admin-login" type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--muted)' }}>
          <a href="/" style={{ color: 'var(--muted)', textDecoration: 'underline' }}>← Voltar ao Diagnóstico</a>
        </p>
      </div>
    </div>
  )
}
