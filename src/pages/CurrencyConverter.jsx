import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useFinance } from '../context/FinanceContext'
import './CurrencyConverter.css'

const API_KEY = '9b64e1a1b5e730d321ede941'
const API_BASE = `https://v6.exchangerate-api.com/v6/${API_KEY}`

const POPULAR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾' },
]

export default function CurrencyConverter() {
  const { expenses } = useFinance()
  const [from, setFrom] = useState('INR')
  const [to, setTo] = useState('USD')
  const [amount, setAmount] = useState('1000')
  const [rates, setRates] = useState(null)
  const [allCurrencies, setAllCurrencies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [converted, setConverted] = useState(null)
  const [convHistory, setConvHistory] = useState([])
  const debounceRef = useRef(null)

  // Fetch rates from API
  const fetchRates = useCallback(async (baseCurrency) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/latest/${baseCurrency}`)
      const data = await res.json()
      if (data.result === 'success') {
        setRates(data.conversion_rates)
        setLastUpdated(new Date())
        setAllCurrencies(Object.keys(data.conversion_rates).map(code => ({
          code,
          flag: POPULAR_CURRENCIES.find(c => c.code === code)?.flag || '🌐',
          name: POPULAR_CURRENCIES.find(c => c.code === code)?.name || code,
        })))
        return data.conversion_rates
      } else {
        setError('API error: ' + data['error-type'])
        return null
      }
    } catch (e) {
      setError('Network error. Check your connection.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRates(from) }, [from, fetchRates])

  // Debounced conversion
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (rates && amount) {
        const rate = rates[to]
        if (rate) {
          const result = parseFloat(amount) * rate
          setConverted(result)
        }
      }
    }, 300)
  }, [amount, to, rates])

  const handleSwap = () => {
    setFrom(to)
    setTo(from)
  }

  const handleConvert = () => {
    if (!rates || !amount) return
    const rate = rates[to]
    if (!rate) return
    const result = parseFloat(amount) * rate
    setConverted(result)
    setConvHistory(prev => [{
      from, to, amount: parseFloat(amount), result, rate,
      time: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 5))
  }

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const expensesConverted = rates && rates[to] ? totalExpenses * rates[to] : null

  const fmt = (n, currency) => {
    if (!n) return '—'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 2 }).format(n)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Currency Converter</div>
        <div className="page-sub">Live exchange rates via ExchangeRate API</div>
      </div>

      {/* API Status Banner */}
      <div className={`api-banner ${error ? 'api-banner-error' : 'api-banner-ok'}`}>
        <div className="api-banner-left">
          <div className={`api-dot ${loading ? 'api-dot-loading' : error ? 'api-dot-error' : 'api-dot-ok'}`} />
          <div>
            <div className="api-banner-title">
              {loading ? 'Fetching live rates...' : error ? 'API Error' : 'Live Rates Active'}
            </div>
            <div className="api-banner-sub">
              {error ? error : lastUpdated ? `Updated: ${lastUpdated.toLocaleTimeString()}` : 'Connecting to ExchangeRate-API...'}
            </div>
          </div>
        </div>
        <div className="api-banner-right">
          <div className="api-key-display">
            <span style={{ color: 'var(--text3)', fontSize: '11px', marginRight: '6px' }}>KEY</span>
            <span className="api-key-val">{API_KEY.slice(0, 8)}••••••••••••</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '3px' }}>v6.exchangerate-api.com</div>
          <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: '11px', marginTop: '6px' }} onClick={() => fetchRates(from)} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh ↻'}
          </button>
        </div>
      </div>

      {/* Main Converter */}
      <div className="converter-hero">
        <div className="converter-card">
          <div className="conv-title">Convert Amount</div>
          <div className="conv-row">
            <div className="conv-field">
              <label className="form-label">Amount</label>
              <input
                className="form-input conv-amount-input"
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
              />
            </div>
            <div className="conv-field">
              <label className="form-label">From</label>
              <select className="form-select" value={from} onChange={e => setFrom(e.target.value)}>
                {(allCurrencies.length ? allCurrencies : POPULAR_CURRENCIES).map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                ))}
              </select>
            </div>
            <button className="swap-btn" onClick={handleSwap} title="Swap currencies">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
            </button>
            <div className="conv-field">
              <label className="form-label">To</label>
              <select className="form-select" value={to} onChange={e => setTo(e.target.value)}>
                {(allCurrencies.length ? allCurrencies : POPULAR_CURRENCIES).map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button className="btn btn-primary convert-btn" onClick={handleConvert} disabled={loading || !rates}>
            {loading ? 'Loading rates...' : 'Convert Now'}
          </button>

          {converted !== null && !error && (
            <div className="conv-result">
              <div className="conv-result-from">{fmt(parseFloat(amount) || 0, from)}</div>
              <div className="conv-result-eq">=</div>
              <div className="conv-result-to">{fmt(converted, to)}</div>
              {rates && <div className="conv-rate-note">1 {from} = {(rates[to] || 0).toFixed(6)} {to}</div>}
            </div>
          )}
        </div>

        {/* Quick rates panel */}
        <div className="quick-rates">
          <div className="section-title"><span>Quick Rates (Base: {from})</span></div>
          <div className="rates-grid">
            {POPULAR_CURRENCIES.filter(c => c.code !== from).map(c => (
              <div key={c.code} className="rate-item" onClick={() => setTo(c.code)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{c.flag}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{c.code}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{c.name}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {rates ? (
                    <div style={{ fontSize: '14px', fontWeight: 700, color: to === c.code ? 'var(--accent)' : 'var(--text)' }}>
                      {(rates[c.code] || 0).toFixed(4)}
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: 'var(--text3)' }}>—</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expense Value in Foreign Currency */}
      {expensesConverted !== null && (
        <div className="card" style={{ marginBottom: '24px', borderColor: 'var(--accent)', borderWidth: '1px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div className="section-title" style={{ margin: 0, marginBottom: '6px' }}>
                <span>💡 Your total expenses in {to}</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
                All ₹{totalExpenses.toLocaleString('en-IN')} of your recorded expenses equals
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '-1px' }}>
                {fmt(expensesConverted, to)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>at current rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Conversion History */}
      {convHistory.length > 0 && (
        <div className="card">
          <div className="section-title"><span>Recent Conversions</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {convHistory.map((h, i) => (
              <div key={i} className="hist-item">
                <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{h.time}</div>
                <div style={{ fontSize: '14px', color: 'var(--text)', flex: 1, textAlign: 'center' }}>
                  {fmt(h.amount, h.from)} → <strong style={{ color: 'var(--accent)' }}>{fmt(h.result, h.to)}</strong>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Rate: {h.rate.toFixed(4)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
