import { useState } from 'react'
import { displayNumber } from '../../lib/analytics'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Legend, ReferenceLine, LabelList,
} from 'recharts'

// Neural Hub brand: one orange accent; neutral comparators, no rainbow defaults.
const COLORS = ['#ff6a00', '#f5f2ea', '#ffac70', '#a9a398', '#d97d39']
const axis = { fill: '#b6b0a5', fontSize: 11, fontFamily: 'Space Mono, monospace' }
const tooltip = { background: '#141414', border: '1px solid #55514a', borderRadius: 6, color: '#f5f2ea', fontSize: 12, boxShadow: '0 12px 32px #0008' }

function CategoryTick({ x = 0, y = 0, payload = { value: '' } }) {
  const words = String(payload.value).split(' ')
  const lines = ['']
  words.forEach(word => {
    if ((lines.at(-1) + word).length > 20) lines.push(word)
    else lines[lines.length - 1] += `${lines.at(-1) ? ' ' : ''}${word}`
  })
  return <text x={x - 8} y={y} fill={axis.fill} fontSize={11} textAnchor="end" fontFamily="var(--font-sans)">
    {lines.map((line, index) => <tspan key={index} x={x - 8} dy={index ? 13 : -(lines.length - 1) * 6.5 + 4}>{line}</tspan>)}
  </text>
}

/** @param {{ columns: Array<{key: string, label: string}>, rows: Array<Record<string, any>>, caption: string }} props */
export function AnalyticsTable({ columns, rows, caption }) {
  const [sort, setSort] = useState({ key: '', dir: 1 })
  const sorted = [...rows].sort((a, b) => {
    const av = a[sort.key], bv = b[sort.key]
    if (av == null) return bv == null ? 0 : 1
    if (bv == null) return -1
    return sort.dir * (typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv), 'pt-BR'))
  })
  return <div className="analytics-table-wrap" tabIndex={0} role="region" aria-label={caption}>
    <table className="admin-table"><caption>{caption}</caption>
      <thead><tr>{columns.map(column => <th key={column.key} aria-sort={sort.key === column.key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
        <button type="button" onClick={() => setSort({ key: column.key, dir: sort.key === column.key ? -sort.dir : 1 })}>
          {column.label} {sort.key === column.key ? (sort.dir === 1 ? '↑' : '↓') : '↕'}
        </button>
      </th>)}</tr></thead>
      <tbody>{sorted.map((row, index) => <tr key={row.id ?? row.name ?? index}>{columns.map(column => <td key={column.key}>
        {typeof row[column.key] === 'number' ? displayNumber(row[column.key]) : row[column.key] ?? '—'}
      </td>)}</tr>)}</tbody>
    </table>
    {!rows.length && <p className="analytics-empty">Nenhum registro neste recorte.</p>}
  </div>
}

/** @param {{ title: string, description: string, rows: Array<Record<string, any>>, valueKey?: string, valueLabel?: string, max?: number, modes?: string[], reference?: number, comparison?: boolean, comparisonLabel?: string, columns?: Array<{key:string,label:string}> }} props */
export function ChartPanel({ title, description, rows, valueKey = 'value', valueLabel = 'Respondentes', max,
  modes = ['bar', 'table'], reference, comparison = false, comparisonLabel = 'Referência (%)', columns }) {
  const [selectedMode, setMode] = useState(modes[0])
  const mode = modes.includes(selectedMode) ? selectedMode : modes[0]
  const labels = { bar: 'Barras', radar: 'Radar', pie: 'Rosca', table: 'Tabela' }
  const fields = columns ?? [{ key: 'name', label: 'Grupo' }, { key: valueKey, label: valueLabel }, ...(comparison ? [{ key: 'benchmark', label: 'Referência (%)' }] : [])]
  const empty = !rows.some(row => (row[valueKey] != null && (max !== undefined || row[valueKey] > 0)) || (comparison && row.benchmark != null))
  const chartTooltip = <Tooltip contentStyle={tooltip} itemStyle={{ color: '#f5f2ea' }} cursor={{ fill: '#ffffff06' }} formatter={value => displayNumber(Number(value))} />
  let chart
  if (mode === 'radar') chart = <RadarChart data={rows} outerRadius="62%">
    <PolarGrid stroke="#ffffff1a" /><PolarAngleAxis dataKey="name" tick={{ ...axis, fontSize: 10 }} tickFormatter={value => String(value).length > 16 ? `${String(value).slice(0, 14)}…` : String(value)} />
    <PolarRadiusAxis domain={[0, 100]} tick={axis} tickCount={5} axisLine={false} />{chartTooltip}<Legend iconType="plainline" />
    <Radar dataKey={valueKey} name={valueLabel} stroke={COLORS[0]} strokeWidth={2} fill={COLORS[0]} fillOpacity={0.16} dot={{ r: 3, fill: COLORS[0] }} isAnimationActive={false} />
    {comparison && <Radar dataKey="benchmark" name={comparisonLabel} stroke={COLORS[1]} strokeWidth={2} strokeDasharray="5 4" fill={COLORS[1]} fillOpacity={0.03} dot={{ r: 3, fill: '#101010', stroke: COLORS[1] }} isAnimationActive={false} />}
  </RadarChart>
  else if (mode === 'pie') chart = <PieChart>{chartTooltip}<Legend iconType="circle" />
    <Pie data={rows} dataKey={valueKey} nameKey="name" innerRadius="48%" outerRadius="70%" paddingAngle={3} stroke="#101010" strokeWidth={2} isAnimationActive={false}>
      {rows.map((row, index) => <Cell key={row.name} fill={COLORS[index % COLORS.length]} />)}
    </Pie>
  </PieChart>
  else chart = <BarChart data={rows} layout="vertical" margin={{ left: 0, right: 42, top: 8, bottom: 8 }} barCategoryGap="30%" barGap={5}>
    <CartesianGrid stroke="#ffffff12" strokeDasharray="2 6" horizontal={false} />
    <XAxis type="number" tick={axis} tickLine={false} axisLine={false} domain={max === undefined ? [0, 'auto'] : [0, max]} allowDecimals={max !== undefined} />
    <YAxis dataKey="name" type="category" width={128} tick={<CategoryTick />} axisLine={false} tickLine={false} interval={0} />{chartTooltip}{comparison && <Legend iconType="square" />}
    <Bar dataKey={valueKey} name={valueLabel} fill={COLORS[0]} maxBarSize={18} radius={[0, 3, 3, 0]} isAnimationActive={false}>
      <LabelList dataKey={valueKey} position="right" fill={COLORS[0]} fontSize={11} formatter={value => value == null ? '' : displayNumber(Number(value))} />
    </Bar>
    {comparison && <Bar dataKey="benchmark" name={comparisonLabel} fill={COLORS[1]} maxBarSize={18} radius={[0, 3, 3, 0]} isAnimationActive={false}><LabelList dataKey="benchmark" position="right" fill={COLORS[1]} fontSize={11} formatter={value => value == null ? '' : displayNumber(Number(value))} /></Bar>}
    {reference != null && <ReferenceLine x={reference} stroke={COLORS[1]} strokeWidth={1.5} strokeDasharray="5 5" />}
  </BarChart>
  return <section className="card analytics-chart" aria-label={title}>
    <div className="analytics-chart-heading"><div><h3>{title}</h3><p>{description}</p><div className="analytics-chart-unit">{valueLabel}{max !== undefined ? ` · escala 0–${max}` : ''}</div></div>
      <select aria-label={`Visualização: ${title}`} value={mode} onChange={event => setMode(event.target.value)}>
        {modes.map(item => <option key={item} value={item}>{labels[item]}</option>)}
      </select>
    </div>
    {mode === 'table' ? <AnalyticsTable columns={fields} rows={rows} caption={title} /> : empty ? <p className="analytics-empty">Sem dados válidos para este gráfico.</p> :
      <div className="analytics-chart-canvas" style={{ height: mode === 'bar' ? Math.max(280, rows.length * (comparison ? 58 : 40) + 65) : 360 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 340 }}>{chart}</ResponsiveContainer>
      </div>}
  </section>
}
