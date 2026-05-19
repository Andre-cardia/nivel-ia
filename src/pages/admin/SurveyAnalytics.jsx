import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts'
import { supabase } from '../../lib/supabase'
import { LEVELS, DIMENSION_LABELS, DIMENSION_MAX } from '../../lib/scoring'

// Valores concretos — CSS vars não resolvem em atributos SVG do Recharts
const CHART_ACCENT  = '#ff6a00'
const CHART_GREEN   = '#84cc16'
const CHART_MUTED   = '#8b867c'
const CHART_LINE    = 'rgba(255,255,255,0.08)'
const CHART_TEXT    = '#f5f2ea'

const LEVEL_COLORS = {
  inicial:       '#8b867c',
  basico:        '#ff6a00',
  intermediario: '#84cc16',
  avancado:      '#a78bfa',
  estrategico:   '#f59e0b',
}

const LEVEL_ORDER = LEVELS.map(l => l.key)

function levelLabel(key) {
  return LEVELS.find(l => l.key === key)?.label ?? key
}

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function subDays(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return startOfDay(d)
}

function isoWeek(dateStr) {
  const d = new Date(dateStr)
  const day = d.getDay() || 7
  d.setDate(d.getDate() + 4 - day)
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return `${d.getFullYear()}-S${String(week).padStart(2, '0')}`
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: p.color || 'var(--accent)' }}>
          {p.name ? `${p.name}: ` : ''}{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function SurveyAnalytics({ onSignOut }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [survey, setSurvey] = useState(null)
  const [assessments, setAssessments] = useState([])
  const [dimMap, setDimMap] = useState({})
  const [loading, setLoading] = useState(true)

  // Filtros
  const [period, setPeriod] = useState('all')
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterDept, setFilterDept] = useState('all')
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => {
    async function load() {
      const [{ data: sv }, { data: as }] = await Promise.all([
        supabase.from('surveys').select('*').eq('id', id).single(),
        supabase.from('assessments').select('*').eq('survey_id', id).order('created_at', { ascending: true }),
      ])

      setSurvey(sv)
      const list = as ?? []
      setAssessments(list)

      if (list.length > 0) {
        const ids = list.map(a => a.id)
        const { data: dimRows } = await supabase
          .from('assessment_answers')
          .select('assessment_id, dimension, score')
          .in('assessment_id', ids)

        const map = {}
        for (const row of dimRows ?? []) {
          if (!map[row.assessment_id]) map[row.assessment_id] = {}
          map[row.assessment_id][row.dimension] = (map[row.assessment_id][row.dimension] ?? 0) + row.score
        }
        setDimMap(map)
      }

      setLoading(false)
    }
    load()
  }, [id])

  // ── Opções dinâmicas para dropdowns ─────────────────────
  const deptOptions = useMemo(() => {
    const set = new Set(assessments.map(a => a.respondent_department).filter(Boolean))
    return ['all', ...Array.from(set).sort()]
  }, [assessments])

  const roleOptions = useMemo(() => {
    const set = new Set(assessments.map(a => a.respondent_role).filter(Boolean))
    return ['all', ...Array.from(set).sort()]
  }, [assessments])

  // ── Filtro aplicado ───────────────────────────────────────
  const filtered = useMemo(() => {
    let list = assessments
    if (period !== 'all') {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
      const cutoff = subDays(days)
      list = list.filter(a => new Date(a.created_at) >= cutoff)
    }
    if (filterLevel !== 'all') list = list.filter(a => a.level === filterLevel)
    if (filterDept !== 'all') list = list.filter(a => a.respondent_department === filterDept)
    if (filterRole !== 'all') list = list.filter(a => a.respondent_role === filterRole)
    return list
  }, [assessments, period, filterLevel, filterDept, filterRole])

  // ── KPIs ─────────────────────────────────────────────────
  const avgScore = filtered.length
    ? (filtered.reduce((s, a) => s + a.total_score, 0) / filtered.length).toFixed(1)
    : '—'

  const topLevel = useMemo(() => {
    if (!filtered.length) return '—'
    const counts = {}
    filtered.forEach(a => { counts[a.level] = (counts[a.level] ?? 0) + 1 })
    return levelLabel(Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0])
  }, [filtered])

  const last30Count = useMemo(() => {
    const cutoff = subDays(30)
    return assessments.filter(a => new Date(a.created_at) >= cutoff).length
  }, [assessments])

  // ── Gráfico 1: Distribuição de Níveis ────────────────────
  const levelData = useMemo(() => {
    const counts = {}
    filtered.forEach(a => { counts[a.level] = (counts[a.level] ?? 0) + 1 })
    return LEVEL_ORDER.map(key => ({
      name: levelLabel(key),
      key,
      count: counts[key] ?? 0,
      fill: LEVEL_COLORS[key],
    }))
  }, [filtered])

  // ── Gráfico 2: Radar por Dimensão ────────────────────────
  const radarData = useMemo(() => {
    const dims = Object.keys(DIMENSION_LABELS)
    if (!filtered.length) return dims.map(d => ({ dim: DIMENSION_LABELS[d], value: 0 }))
    const sums = {}
    filtered.forEach(a => {
      const scores = dimMap[a.id] ?? {}
      dims.forEach(d => { sums[d] = (sums[d] ?? 0) + (scores[d] ?? 0) })
    })
    return dims.map(d => ({
      dim: DIMENSION_LABELS[d],
      value: Math.round(((sums[d] ?? 0) / filtered.length / DIMENSION_MAX[d]) * 100),
    }))
  }, [filtered, dimMap])

  // ── Gráfico 3: Evolução temporal ─────────────────────────
  const timelineData = useMemo(() => {
    if (!filtered.length) return []
    const weeks = {}
    filtered.forEach(a => {
      const wk = isoWeek(a.created_at)
      if (!weeks[wk]) weeks[wk] = { scores: [], count: 0 }
      weeks[wk].scores.push(a.total_score)
      weeks[wk].count += 1
    })
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, { scores, count }]) => ({
        week,
        média: parseFloat((scores.reduce((s, v) => s + v, 0) / count).toFixed(1)),
        respondentes: count,
      }))
  }, [filtered])

  // ── Gráfico 4: Histograma de pontuação ───────────────────
  const histData = useMemo(() => {
    const bins = LEVELS.map(l => ({ name: l.label, count: 0, fill: LEVEL_COLORS[l.key] }))
    filtered.forEach(a => {
      const idx = LEVELS.findIndex(l => a.total_score >= l.min && a.total_score <= l.max)
      if (idx >= 0) bins[idx].count += 1
    })
    return bins
  }, [filtered])

  // ── Gráfico 5: Top Departamentos ─────────────────────────
  const deptData = useMemo(() => {
    const counts = {}
    filtered.forEach(a => {
      if (a.respondent_department) counts[a.respondent_department] = (counts[a.respondent_department] ?? 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }))
  }, [filtered])

  // ── Gráfico 6: Top Cargos ────────────────────────────────
  const roleData = useMemo(() => {
    const counts = {}
    filtered.forEach(a => {
      if (a.respondent_role) counts[a.respondent_role] = (counts[a.respondent_role] ?? 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }))
  }, [filtered])

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

  const hasData = filtered.length > 0

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

      <main className="admin-main" style={{ overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>

          {/* Header */}
          <div>
            <button className="btn btn-outline" style={{ marginBottom: 'var(--s4)', fontSize: '0.8rem' }} onClick={() => navigate(`/admin/surveys/${id}`)}>
              ← Respondentes
            </button>
            <span className="eyebrow">Analytics</span>
            <h1 style={{ fontSize: '1.5rem', marginTop: 'var(--s2)' }}>{survey.company_name}</h1>
          </div>

          {/* ── Filtros ────────────────────────────────────── */}
          <div className="card" style={{ padding: 'var(--s4) var(--s5)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s4)', alignItems: 'center' }}>

              {/* Período — pills */}
              <div style={{ display: 'flex', gap: 'var(--s2)', alignItems: 'center' }}>
                <span className="eyebrow" style={{ color: 'var(--muted)', marginRight: 'var(--s1)' }}>Período</span>
                {[['all', 'Tudo'], ['7d', '7d'], ['30d', '30d'], ['90d', '90d']].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setPeriod(val)}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      padding: '4px 10px',
                      borderRadius: 4,
                      border: '1px solid',
                      cursor: 'pointer',
                      background: period === val ? 'var(--accent)' : 'transparent',
                      color: period === val ? '#000' : 'var(--muted)',
                      borderColor: period === val ? 'var(--accent)' : 'var(--line)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Nível */}
              <div style={{ display: 'flex', gap: 'var(--s2)', alignItems: 'center' }}>
                <span className="eyebrow" style={{ color: 'var(--muted)' }}>Nível</span>
                <select
                  value={filterLevel}
                  onChange={e => setFilterLevel(e.target.value)}
                  className="input-field"
                  style={{ minHeight: 32, padding: '0 10px', fontSize: '0.8rem', width: 'auto' }}
                >
                  <option value="all">Todos</option>
                  {LEVELS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
                </select>
              </div>

              {/* Departamento */}
              {deptOptions.length > 1 && (
                <div style={{ display: 'flex', gap: 'var(--s2)', alignItems: 'center' }}>
                  <span className="eyebrow" style={{ color: 'var(--muted)' }}>Depto</span>
                  <select
                    value={filterDept}
                    onChange={e => setFilterDept(e.target.value)}
                    className="input-field"
                    style={{ minHeight: 32, padding: '0 10px', fontSize: '0.8rem', width: 'auto' }}
                  >
                    {deptOptions.map(d => <option key={d} value={d}>{d === 'all' ? 'Todos' : d}</option>)}
                  </select>
                </div>
              )}

              {/* Cargo */}
              {roleOptions.length > 1 && (
                <div style={{ display: 'flex', gap: 'var(--s2)', alignItems: 'center' }}>
                  <span className="eyebrow" style={{ color: 'var(--muted)' }}>Cargo</span>
                  <select
                    value={filterRole}
                    onChange={e => setFilterRole(e.target.value)}
                    className="input-field"
                    style={{ minHeight: 32, padding: '0 10px', fontSize: '0.8rem', width: 'auto' }}
                  >
                    {roleOptions.map(r => <option key={r} value={r}>{r === 'all' ? 'Todos' : r}</option>)}
                  </select>
                </div>
              )}

              {/* Reset */}
              {(period !== 'all' || filterLevel !== 'all' || filterDept !== 'all' || filterRole !== 'all') && (
                <button
                  onClick={() => { setPeriod('all'); setFilterLevel('all'); setFilterDept('all'); setFilterRole('all') }}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0 }}
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          {/* ── KPIs ───────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--s4)' }}>
            {[
              { label: 'Respondentes', value: filtered.length, sub: `de ${assessments.length} total` },
              { label: 'Média Geral', value: avgScore, sub: '/ 29 pontos' },
              { label: 'Nível Frequente', value: topLevel, sub: null },
              { label: 'Últimos 30 dias', value: last30Count, sub: 'respondentes' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="card" style={{ textAlign: 'center', padding: 'var(--s5)' }}>
                <p className="eyebrow" style={{ marginBottom: 'var(--s2)', fontSize: '0.6rem' }}>{label}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{value}</p>
                {sub && <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 'var(--s1)', fontFamily: 'var(--font-mono)' }}>{sub}</p>}
              </div>
            ))}
          </div>

          {!hasData && (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--s8)' }}>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Nenhum dado para os filtros selecionados.</p>
            </div>
          )}

          {hasData && (
            <>
              {/* ── Linha 1: Níveis + Radar ─────────────────── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--s4)' }}>

                {/* Distribuição de Níveis */}
                <div className="card">
                  <p className="eyebrow" style={{ marginBottom: 'var(--s5)' }}>Distribuição de Níveis</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={levelData} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
                      <XAxis type="number" allowDecimals={false} tick={{ fill: CHART_MUTED, fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fill: CHART_TEXT, fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,106,0,0.1)' }} />
                      <Bar dataKey="count" name="Respondentes" radius={[0, 4, 4, 0]}>
                        {levelData.map((entry) => (
                          <Cell key={entry.key} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Radar por Dimensão */}
                <div className="card">
                  <p className="eyebrow" style={{ marginBottom: 'var(--s5)' }}>Média por Dimensão (%)</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData} margin={{ top: 0, right: 16, bottom: 0, left: 16 }}>
                      <PolarGrid stroke={CHART_LINE} />
                      <PolarAngleAxis dataKey="dim" tick={{ fill: CHART_MUTED, fontSize: 10 }} />
                      <Radar name="%" dataKey="value" stroke={CHART_ACCENT} fill={CHART_ACCENT} fillOpacity={0.2} />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ── Linha 2: Timeline + Histograma ─────────── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--s4)' }}>

                {/* Evolução temporal */}
                <div className="card">
                  <p className="eyebrow" style={{ marginBottom: 'var(--s5)' }}>Evolução Temporal (por semana)</p>
                  {timelineData.length < 2 ? (
                    <p style={{ color: 'var(--muted)', fontSize: '0.8rem', textAlign: 'center', padding: 'var(--s6) 0' }}>Dados insuficientes para exibir tendência.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={timelineData} margin={{ left: 0, right: 16, top: 4, bottom: 0 }}>
                        <CartesianGrid stroke={CHART_LINE} strokeDasharray="3 3" />
                        <XAxis dataKey="week" tick={{ fill: CHART_MUTED, fontSize: 10 }} />
                        <YAxis domain={[0, 29]} tick={{ fill: CHART_MUTED, fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '0.75rem', color: CHART_MUTED }} />
                        <Line type="monotone" dataKey="média" stroke={CHART_ACCENT} strokeWidth={2} dot={{ r: 3, fill: CHART_ACCENT }} />
                        <Line type="monotone" dataKey="respondentes" stroke={CHART_GREEN} strokeWidth={1} strokeDasharray="4 2" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Histograma de pontuação */}
                <div className="card">
                  <p className="eyebrow" style={{ marginBottom: 'var(--s5)' }}>Histograma de Pontuação</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={histData} margin={{ left: 0, right: 16, top: 4, bottom: 40 }}>
                      <XAxis dataKey="name" tick={{ fill: CHART_MUTED, fontSize: 9 }} angle={-30} textAnchor="end" interval={0} />
                      <YAxis allowDecimals={false} tick={{ fill: CHART_MUTED, fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,106,0,0.1)' }} />
                      <Bar dataKey="count" name="Respondentes" radius={[4, 4, 0, 0]}>
                        {histData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ── Linha 3: Departamentos + Cargos ────────── */}
              {(deptData.length > 0 || roleData.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--s4)' }}>

                  {deptData.length > 0 && (
                    <div className="card">
                      <p className="eyebrow" style={{ marginBottom: 'var(--s5)' }}>Top Departamentos</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={deptData} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
                          <XAxis type="number" allowDecimals={false} tick={{ fill: CHART_MUTED, fontSize: 11 }} />
                          <YAxis type="category" dataKey="name" width={120} tick={{ fill: CHART_TEXT, fontSize: 11 }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,106,0,0.1)' }} />
                          <Bar dataKey="count" name="Respondentes" fill={CHART_GREEN} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {roleData.length > 0 && (
                    <div className="card">
                      <p className="eyebrow" style={{ marginBottom: 'var(--s5)' }}>Top Cargos</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={roleData} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
                          <XAxis type="number" allowDecimals={false} tick={{ fill: CHART_MUTED, fontSize: 11 }} />
                          <YAxis type="category" dataKey="name" width={120} tick={{ fill: CHART_TEXT, fontSize: 11 }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,106,0,0.1)' }} />
                          <Bar dataKey="count" name="Respondentes" fill="#a78bfa" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
