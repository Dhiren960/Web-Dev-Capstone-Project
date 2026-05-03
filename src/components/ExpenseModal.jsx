import React, { useState } from 'react'
import { format } from 'date-fns'
import { useFinance } from '../context/FinanceContext'
import './ExpenseModal.css'

export default function ExpenseModal({ expense, onClose }) {
  const { addExpense, editExpense, CATEGORIES } = useFinance()
  const isEdit = !!expense

  const [form, setForm] = useState({
    title: expense?.title || '',
    amount: expense?.amount || '',
    category: expense?.category || 'food',
    date: expense?.date || format(new Date(), 'yyyy-MM-dd'),
    note: expense?.note || '',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount'
    if (!form.date) e.date = 'Date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const data = { ...form, amount: parseFloat(form.amount) }
    if (isEdit) editExpense({ ...expense, ...data })
    else addExpense(data)
    onClose()
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{isEdit ? 'Edit Expense' : 'Add Expense'}</div>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* Category picker */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Category</label>
            <div className="cat-picker">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  className={`cat-pick-item ${form.category === c.id ? 'selected' : ''}`}
                  style={{ '--cat-color': c.color }}
                  onClick={() => set('category', c.id)}
                >
                  <span style={{ fontSize: '20px' }}>{c.icon}</span>
                  <span style={{ fontSize: '11px' }}>{c.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Description *</label>
              <input
                className={`form-input ${errors.title ? 'input-error' : ''}`}
                placeholder="e.g. Grocery shopping"
                value={form.title}
                onChange={e => set('title', e.target.value)}
              />
              {errors.title && <span className="error-msg">{errors.title}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input
                className={`form-input ${errors.amount ? 'input-error' : ''}`}
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                min="0"
              />
              {errors.amount && <span className="error-msg">{errors.amount}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                className={`form-input ${errors.date ? 'input-error' : ''}`}
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
              />
              {errors.date && <span className="error-msg">{errors.date}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <input
                className="form-input"
                placeholder="Add a note..."
                value={form.note}
                onChange={e => set('note', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {isEdit ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  )
}
