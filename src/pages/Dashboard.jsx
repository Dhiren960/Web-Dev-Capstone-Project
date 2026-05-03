import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'
import { useFinance } from '../context/FinanceContext'
import ExpenseModal from '../components/ExpenseModal'
import './Dashboard.css'

export default function Dashboard() {
  const { expenses, budget, setBudget, CATEGORIES } = useFinance()
  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState(budget.toString())
  const navigate = useNavigate()

  const handleSaveBudget = () => {
    const val = parseFloat(budgetInput)
    if (!isNaN(val) && val > 0) { setBudget(val); setEditingBudget(false) }
  }

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const thisMonth = useMemo(() =>
    expenses.filter(e => {
      try { return isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd }) }
      catch { return false }
    }), [expenses])

  const totalSpent = useMemo(() => thisMonth.reduce((s, e) => s + e.amount, 0), [thisMonth])
  const remaining = budget - totalSpent
  const budgetPct = Math.min((totalSpent / budget) * 100, 100)

  const recentExpenses = expenses.slice(0, 5)

  const catTotals = useMemo(() => {
    const map = {}
    thisMonth.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount })
    return CATEGORIES.map(c => ({ ...c, total: map[c.id] || 0 }))
      .filter(c => c.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 4)
  }, [thisMonth, CATEGORIES])

  const topCategory = catTotals[0]

  const fmt = (n) => '₹' + n.toLocaleString('en-IN')

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Good day 👋</div>
          <div className="page-sub">{format(now, 'EEEE, MMMM d, yyyy')}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Expense
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card red">
          <div className="stat-label">Spent This Month</div>
          <div className="stat-value" style={{ color: totalSpent > budget ? 'var(--red)' : 'var(--text)' }}>{fmt(totalSpent)}</div>
          <div className="stat-sub">{thisMonth.length} transactions</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Budget Remaining</div>
          <div className="stat-value" style={{ color: remaining < 0 ? 'var(--red)' : 'var(--accent)' }}>{fmt(Math.abs(remaining))}</div>
          <div className="stat-sub">{remaining < 0 ? 'Over budget!' : 'Available to spend'}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Monthly Budget
            <button onClick={() => { setEditingBudget(true); setBudgetInput(budget.toString()) }} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: '11px', cursor: 'pointer', padding: 0, fontFamily: 'var(--sans)', fontWeight: 600 }}>
              ✏️ Edit
            </button>
          </div>
          {editingBudget ? (
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
              <input
                className="form-input"
                type="number"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveBudget(); if (e.key === 'Escape') setEditingBudget(false) }}
                autoFocus
                style={{ padding: '6px 10px', fontSize: '15px', flex: 1, minWidth: 0 }}
              />
              <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={handleSaveBudget}>Save</button>
              <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '13px' }} onClick={() => setEditingBudget(false)}>✕</button>
            </div>
          ) : (
            <>
              <div className="stat-value">{fmt(budget)}</div>
              <div className="stat-sub">Click Edit to change</div>
            </>
          )}
        </div>
        <div className="stat-card amber">
          <div className="stat-label">Top Category</div>
          <div className="stat-value" style={{ fontSize: '20px' }}>
            {topCategory ? `${topCategory.icon} ${topCategory.label}` : '—'}
          </div>
          <div className="stat-sub">{topCategory ? fmt(topCategory.total) : 'No data'}</div>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', alignItems: 'center' }}>
          <div className="section-title" style={{ margin: 0 }}>
            <span>Monthly Budget Usage</span>
          </div>
          <div style={{ font: '13px/1 var(--sans)', color: 'var(--text2)' }}>{budgetPct.toFixed(1)}%</div>
        </div>
        <div className="budget-track">
          <div className="budget-fill" style={{
            width: `${budgetPct}%`,
            background: budgetPct > 90 ? 'var(--red)' : budgetPct > 70 ? 'var(--amber)' : 'var(--accent)'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Spent: {fmt(totalSpent)}</span>
          <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Budget: {fmt(budget)}</span>
        </div>
      </div>

      <div className="dash-grid">
        {/* Category Breakdown */}
        <div className="card">
          <div className="section-title">
            <span>Category Breakdown</span>
            <button className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => navigate('/analytics')}>
              View All →
            </button>
          </div>
          <div className="cat-list">
            {catTotals.length === 0 && (
              <div className="empty-state" style={{ padding: '30px' }}>
                <div className="empty-title">No expenses this month</div>
              </div>
            )}
            {catTotals.map(cat => {
              const pct = totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0
              return (
                <div key={cat.id} className="cat-item">
                  <div className="cat-icon" style={{ background: cat.color + '22', color: cat.color }}>{cat.icon}</div>
                  <div className="cat-info">
                    <div className="cat-name">{cat.label}</div>
                    <div className="cat-bar-wrap">
                      <div className="cat-bar" style={{ width: `${pct}%`, background: cat.color }} />
                    </div>
                  </div>
                  <div className="cat-amt">{fmt(cat.total)}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="card">
          <div className="section-title">
            <span>Recent Transactions</span>
            <button className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => navigate('/expenses')}>
              View All →
            </button>
          </div>
          <div className="recent-list">
            {recentExpenses.map(exp => {
              const cat = CATEGORIES.find(c => c.id === exp.category)
              return (
                <div key={exp.id} className="recent-item">
                  <div className="cat-icon" style={{ background: (cat?.color || '#888') + '22', color: cat?.color || '#888' }}>
                    {cat?.icon || '📦'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{format(parseISO(exp.date), 'MMM d')} · {cat?.label}</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--red)', whiteSpace: 'nowrap' }}>-₹{exp.amount.toLocaleString('en-IN')}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {showModal && <ExpenseModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
