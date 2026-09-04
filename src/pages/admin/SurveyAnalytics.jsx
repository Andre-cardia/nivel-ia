import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import { supabase } from '../../lib/supabase'
import { DIMENSION_LABELS, DIMENSION_MAX } from '../../lib/scoring'
import {
  answerDimensionScores,
  assessmentVersion,
  averageKnowledgeScore,
  isKnowledgeAssessment,
  KNOWLEDGE_MAX,
  KNOWLEDGE_VERSION,
  versionLabel,
} from '../../lib/assessmentVersions'

const CHART_ACCENT = '#ff6a00'
const CHART_GREEN = '#84cc16'
const CHART_MUTED = '#8b867c'
const CHART_LINE = 'rgba(255,255,255,0.08)'

function subDays(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(0, 0, 0, 0)
  return date
}
function isoWeek(dateString) {
  const date = new Date(dateString)
  const day = date.getDay() || 7
  date.setDate(date.getDate() + 4 - day)
  const yearStart = new Date(date.getFullYear(), 0, 1)
  return `${date.getFullYear()}-S${String(Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)).padStart(2, '0')}`
}

/**
 * @param {{
 *   active?: boolean,
 *   payload?: Array<{ dataKey?: string, name?: string, value?: string | number, color?: string }>,
 *   label?: string | number,
 * }} props
 */
function CustomTooltip({ active, payload, label } = {}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)' }}>{label}</p>
      {payload.map(item => (
        <p key={item.dataKey} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: item.color || 'var(--accent)' }}>
          {item.name}: {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
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
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(KNOWLEDGE_VERSION)
  const [period, setPeriod] = useState('all')
  const [department, setDepartment] = useState('all')

  useEffect(() => {
    Promise.all([
      supabase.from('surveys').select('*').eq('id', id).single(),
      supabase.from('assessments').select('*').eq('survey_id', id).order('created_at', { ascending: true }),
    ]).then(([surveyResult, assessmentResult]) => {
      setSurvey(surveyResult.data)
      const list = assessmentResult.data ?? []
      setAssessments(list)
      if (!list.some(item => assessmentVersion(item) === KNOWLEDGE_VERSION) && list.length) {
        setVersion(assessmentVersion(list[0]))
      }
      setLoading(false)
    })
  }, [id])

  const versions = useMemo(() => {
    const detected = [...new Set(assessments.map(assessmentVersion))].sort((a, b) => (
      a === KNOWLEDGE_VERSION ? -1 : b === KNOWLEDGE_VERSION ? 1 : a.localeCompare(b)
    ))
    return detected.length ? detected : [KNOWLEDGE_VERSION]
  }, [assessments])

  const departments = useMemo(
    () => [...new Set(assessments.map(item => item.respondent_department).filter(Boolean))].sort(),
    [assessments],
  )

  const filtered = useMemo(() => assessments.filter(item => {
    if (assessmentVersion(item) !== version) return false
    if (period !== 'all') {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
      if (new Date(item.created_at) < subDays(days)) return false
    }
    return department === 'all' || item.respondent_department === department
  }), [assessments, version, period, department])

  const isKnowledge = version === KNOWLEDGE_VERSION
  const validKnowledge = useMemo(
    () => isKnowledge ? filtered.filter(isKnowledgeAssessment) : [],
    [filtered, isKnowledge],
  )
  const average = averageKnowledgeScore(validKnowledge)

  const scoreData = useMemo(() => {
    const bins = [
      { name: '0–5', min: 0, max: 5, count: 0 },
      { name: '6–10', min: 6, max: 10, count: 0 },
      { name: '11–15', min: 11, max: 15, count: 0 },
      { name: '16–20', min: 16, max: 20, count: 0 },
      { name: '21–26', min: 21, max: 26, count: 0 },
    ]
    validKnowledge.forEach(item => {
      const bin = bins.find(candidate => item.total_score >= candidate.min && item.total_score <= candidate.max)
      if (bin) bin.count += 1
    })
    return bins
  }, [validKnowledge])

  const radarData = useMemo(() => Object.keys(DIMENSION_LABELS).map(dimension => {
    if (!validKnowledge.length) return { dimension: DIMENSION_LABELS[dimension], value: 0 }
    const sum = validKnowledge.reduce(
      (total, assessment) => total + (answerDimensionScores(assessment)[dimension] ?? 0),
      0,
    )
    return {
      dimension: DIMENSION_LABELS[dimension],
      value: Math.round((sum / validKnowledge.length / DIMENSION_MAX[dimension]) * 100),
    }
  }), [validKnowledge])

  const timelineData = useMemo(() => {
    const weeks = {}
    validKnowledge.forEach(item => {
      const week = isoWeek(item.created_at)
      weeks[week] ??= []
      weeks[week].push(item.total_score)
    })
    return Object.entries(weeks).map(([week, scores]) => ({
      week,
      média: scores.reduce((sum, score) => sum + score, 0) / scores.length,
    }))
  }, [validKnowledge])

  if (loading) return <div className="admin-main"><div className="spinner spinner-lg" /></div>
  if (!survey) return <div className="admin-main"><p>Pesquisa não encontrada.</p></div>

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="brand-logo"><div className="brand-logo-icon">N</div><span className="brand-logo-text">Nível IA</span></div>
        <nav style={{ marginTop: 'var(--s6)' }}><span className="eyebrow">Analytics</span></nav>
        <button className="btn btn-outline w-full" onClick={onSignOut} style={{ marginTop: 'auto' }}>Sair</button>
      </aside>

      <main className="admin-main">
        <button className="btn btn-outline" onClick={() => navigate(`/admin/surveys/${id}`)}>← Respondentes</button>
        <h1 style={{ fontSize: '1.5rem', margin: 'var(--s4) 0' }}>{survey.company_name}</h1>

        <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s4)', alignItems: 'center' }}>
          <label className="input-label" htmlFor="analytics-version">Versão</label>
          <select id="analytics-version" className="input-field" value={version} onChange={event => setVersion(event.target.value)} style={{ width: 'auto' }}>
            {versions.map(item => <option key={item} value={item}>{versionLabel(item)}</option>)}
          </select>
          <label className="input-label" htmlFor="analytics-period">Período</label>
          <select id="analytics-period" className="input-field" value={period} onChange={event => setPeriod(event.target.value)} style={{ width: 'auto' }}>
            <option value="all">Tudo</option><option value="7d">7 dias</option><option value="30d">30 dias</option><option value="90d">90 dias</option>
          </select>
          <label className="input-label" htmlFor="analytics-department">Departamento</label>
          <select id="analytics-department" className="input-field" value={department} onChange={event => setDepartment(event.target.value)} style={{ width: 'auto' }}>
            <option value="all">Todos</option>
            {departments.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--s4)', marginTop: 'var(--s4)' }}>
          <div className="card"><p className="eyebrow">Respondentes nesta versão</p><p className="metric-display">{filtered.length}</p></div>
          {isKnowledge && <div className="card"><p className="eyebrow">Média de acertos</p><p className="metric-display">{average?.toFixed(1) ?? '—'}<span className="metric-total">/{KNOWLEDGE_MAX}</span></p></div>}
        </div>

        {!isKnowledge && (
          <div className="card" style={{ marginTop: 'var(--s4)' }}>
            <p className="eyebrow">Histórico preservado</p>
            <p style={{ marginTop: 'var(--s2)', color: 'var(--muted)' }}>Esta versão não informa um denominador confiável. Totais, médias e dimensões não são agregados com o questionário atual.</p>
          </div>
        )}

        {isKnowledge && validKnowledge.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--s4)', marginTop: 'var(--s4)' }}>
            <div className="card">
              <p className="eyebrow">Distribuição de acertos</p>
              <ResponsiveContainer width="100%" height={230}><BarChart data={scoreData}><XAxis dataKey="name" tick={{ fill: CHART_MUTED }} /><YAxis allowDecimals={false} tick={{ fill: CHART_MUTED }} /><Tooltip content={<CustomTooltip />} /><Bar dataKey="count" name="Respondentes" fill={CHART_ACCENT} /></BarChart></ResponsiveContainer>
            </div>
            <div className="card">
              <p className="eyebrow">Média por tema (%)</p>
              <ResponsiveContainer width="100%" height={230}><RadarChart data={radarData}><PolarGrid stroke={CHART_LINE} /><PolarAngleAxis dataKey="dimension" tick={{ fill: CHART_MUTED, fontSize: 10 }} /><Radar dataKey="value" name="Percentual" stroke={CHART_ACCENT} fill={CHART_ACCENT} fillOpacity={0.2} /><Tooltip content={<CustomTooltip />} /></RadarChart></ResponsiveContainer>
            </div>
            <div className="card">
              <p className="eyebrow">Evolução semanal</p>
              {timelineData.length < 2 ? <p style={{ color: 'var(--muted)', marginTop: 'var(--s5)' }}>Dados insuficientes para exibir tendência.</p> : <ResponsiveContainer width="100%" height={230}><LineChart data={timelineData}><CartesianGrid stroke={CHART_LINE} /><XAxis dataKey="week" tick={{ fill: CHART_MUTED }} /><YAxis domain={[0, KNOWLEDGE_MAX]} tick={{ fill: CHART_MUTED }} /><Tooltip content={<CustomTooltip />} /><Line dataKey="média" stroke={CHART_GREEN} /></LineChart></ResponsiveContainer>}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
