import React, { useMemo, useState } from 'react'
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useFinance } from '../context/FinanceContext'
import './Analytics.css'

const MONTHS = 6

export default function Analytics() {
  const { expenses, budget, CATEGORIES } = useFinance()
  const [activeMonth, setActiveMonth] = useState(0) // 0 = current

  const monthData = useMemo(() => {
    const now = new Date()
    return Array.from({ length: MONTHS }, (_, i) => {
      const d = subMonths(now, i)
      const start = startOfMonth(d)
      const end = endOfMonth(d)
      const list = expenses.filter(e => {
        try { return isWithinInterval(parseISO(e.date), { start, end }) } catch { return false }
      })
      return {
        label: format(d, 'MMM'),
        fullLabel: format(d, 'MMMM yyyy'),
        total: list.reduce((s, e) => s + e.amount, 0),
        count: list.length,
        expenses: list,
      }
    }).reverse()
  }, [expenses])

  const selectedMonth = monthData[MONTHS - 1 - activeMonth] || monthData[MONTHS - 1]

  const catBreakdown = useMemo(() => {
    const map = {}
    selectedMonth.expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount })
    return CATEGORIES.map(c => ({ name: c.label, value: map[c.id] || 0, color: c.color, icon: c.icon }))
      .filter(c => c.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [selectedMonth, CATEGORIES])

  const weeklyData = useMemo(() => {
    const weeks = [
      { label: 'Wk 1', days: [1, 7] },
      { label: 'Wk 2', days: [8, 14] },
      { label: 'Wk 3', days: [15, 21] },
      { label: 'Wk 4', days: [22, 31] },
    ]
    return weeks.map(w => ({
      label: w.label,
      amount: selectedMonth.expenses
        .filter(e => { const d = parseISO(e.date).getDate(); return d >= w.days[0] && d <= w.days[1] })
        .reduce((s, e) => s + e.amount, 0)
    }))
  }, [selectedMonth])

  const fmt = (n) => '₹' + n.toLocaleString('en-IN')

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '10px', padding: '10px 14px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent)' }}>{fmt(payload[0].value)}</div>
      </div>
    )
  }

  const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '10px', padding: '10px 14px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text)' }}>{payload[0].name}</div>
        <div style={{ fontSize: '15px', fontWeight: 600, color: payload[0].payload.color }}>{fmt(payload[0].value)}</div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Analytics</div>
        <div className="page-sub">Spending insights across {MONTHS} months</div>
      </div>

      {/* Month selector */}
      <div className="month-tabs">
        {monthData.map((m, i) => {
          const idx = MONTHS - 1 - i
          return (
            <button key={i} className={`month-tab ${activeMonth === idx ? 'active' : ''}`} onClick={() => setActiveMonth(idx)}>
              <div className="month-tab-label">{m.label}</div>
              <div className="month-tab-val">{fmt(m.total)}</div>
            </button>
          )
        })}
      </div>

      {/* Current month summary */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card red">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value">{fmt(selectedMonth.total)}</div>
          <div className="stat-sub">{selectedMonth.count} transactions</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">vs Budget</div>
          <div className="stat-value" style={{ fontSize: '20px', color: selectedMonth.total > budget ? 'var(--red)' : 'var(--accent)' }}>
            {selectedMonth.total > budget ? 'Over' : 'Under'} by {fmt(Math.abs(budget - selectedMonth.total))}
          </div>
          <div className="stat-sub">Budget: {fmt(budget)}</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-label">Avg Per Transaction</div>
          <div className="stat-value">{selectedMonth.count > 0 ? fmt(Math.round(selectedMonth.total / selectedMonth.count)) : '₹0'}</div>
          <div className="stat-sub">{selectedMonth.fullLabel}</div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* 6-Month Bar Chart */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="section-title"><span>6-Month Spending Trend</span></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthData} barSize={36}>
              <XAxis dataKey="label" tick={{ fill: 'var(--text3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '₹' + (v/1000).toFixed(0) + 'k'} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="total" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="card">
          <div className="section-title"><span>Category Breakdown</span></div>
          {catBreakdown.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div className="empty-icon">📊</div>
              <div className="empty-title">No data for this month</div>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={catBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {catBreakdown.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="cat-legend">
                {catBreakdown.map(c => (
                  <div key={c.name} className="cat-legend-item">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: '12px', color: 'var(--text2)' }}>{c.icon} {c.name}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>₹{c.value.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Weekly breakdown */}
        <div className="card">
          <div className="section-title"><span>Weekly Breakdown</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={28}>
              <XAxis dataKey="label" tick={{ fill: 'var(--text3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '₹' + (v/1000).toFixed(0) + 'k'} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="amount" radius={[5, 5, 0, 0]}>
                {weeklyData.map((_, i) => (
                  <Cell key={i} fill={['var(--blue)', 'var(--teal)', 'var(--amber)', 'var(--pink)'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="cat-legend">
            {catBreakdown.slice(0, 3).map(c => (
              <div key={c.name} className="cat-legend-item">
                <div style={{ flex: 1, fontSize: '12px', color: 'var(--text2)' }}>{c.icon} {c.name}</div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text2)' }}>
                  {selectedMonth.total > 0 ? ((c.value / selectedMonth.total) * 100).toFixed(1) : 0}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
