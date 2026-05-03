import React, { useState, useMemo, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import { useFinance } from '../context/FinanceContext'
import ExpenseModal from '../components/ExpenseModal'
import './Expenses.css'

const ITEMS_PER_PAGE = 10

export default function Expenses() {
  const { expenses, deleteExpense, CATEGORIES } = useFinance()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editExpense, setEditExpense] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = useMemo(() => {
    let list = [...expenses]
    if (search) list = list.filter(e => e.title.toLowerCase().includes(search.toLowerCase()))
    if (filterCat !== 'all') list = list.filter(e => e.category === filterCat)
    switch (sortBy) {
      case 'date-desc': list.sort((a, b) => b.date.localeCompare(a.date)); break
      case 'date-asc': list.sort((a, b) => a.date.localeCompare(b.date)); break
      case 'amt-desc': list.sort((a, b) => b.amount - a.amount); break
      case 'amt-asc': list.sort((a, b) => a.amount - b.amount); break
    }
    return list
  }, [expenses, search, filterCat, sortBy])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0)

  const handleDelete = useCallback((id) => {
    deleteExpense(id)
    setDeleteConfirm(null)
  }, [deleteExpense])

  const handleEdit = (exp) => {
    setEditExpense(exp)
    setShowModal(true)
  }

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1) }
  const handleCat = (e) => { setFilterCat(e.target.value); setPage(1) }

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Expenses</div>
          <div className="page-sub">{filtered.length} records · Total: ₹{totalFiltered.toLocaleString('en-IN')}</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditExpense(null); setShowModal(true) }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="form-input search-input" placeholder="Search expenses..." value={search} onChange={handleSearch} />
        </div>
        <select className="form-select" value={filterCat} onChange={handleCat}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>
        <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amt-desc">Highest Amount</option>
          <option value="amt-asc">Lowest Amount</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {paginated.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No expenses found</div>
            <div style={{ fontSize: '13px', color: 'var(--text3)' }}>Try adjusting your search or filters</div>
          </div>
        ) : (
          <table className="expense-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(exp => {
                const cat = CATEGORIES.find(c => c.id === exp.category)
                return (
                  <tr key={exp.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: '14px' }}>{exp.title}</div>
                      {exp.note && <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{exp.note}</div>}
                    </td>
                    <td>
                      <span className="badge" style={{ background: (cat?.color || '#888') + '22', color: cat?.color || '#888' }}>
                        {cat?.icon} {cat?.label}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text2)', fontSize: '13px' }}>{format(parseISO(exp.date), 'MMM d, yyyy')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--red)', fontSize: '14px' }}>
                      -₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => handleEdit(exp)}>Edit</button>
                        {deleteConfirm === exp.id ? (
                          <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => handleDelete(exp.id)}>Confirm</button>
                        ) : (
                          <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: '12px', color: 'var(--red)' }} onClick={() => setDeleteConfirm(exp.id)}>Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-ghost" style={{ padding: '7px 14px' }} disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ fontSize: '13px', color: 'var(--text2)' }}>Page {page} of {totalPages}</span>
          <button className="btn btn-ghost" style={{ padding: '7px 14px' }} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {showModal && (
        <ExpenseModal
          expense={editExpense}
          onClose={() => { setShowModal(false); setEditExpense(null) }}
        />
      )}
    </div>
  )
}
