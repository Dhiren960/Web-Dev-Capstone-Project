import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { FinanceProvider } from './context/FinanceContext'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Analytics from './pages/Analytics'
import CurrencyConverter from './pages/CurrencyConverter'
import './App.css'

function Nav() {
  return (
    <nav className="sidebar">
      <div className="logo">
        <span className="logo-icon">₹</span>
        <span className="logo-text">Fin<em>Flow</em></span>
      </div>
      <div className="nav-links">
        <NavLink to="/" end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </NavLink>
        <NavLink to="/expenses" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Expenses
        </NavLink>
        <NavLink to="/analytics" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Analytics
        </NavLink>
        <NavLink to="/converter" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Converter
          <span className="live-badge">LIVE</span>
        </NavLink>
      </div>
      <div className="nav-footer">
        <div className="nav-footer-text">ExchangeRate API</div>
        <div className="nav-footer-sub">Live rates powered</div>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <FinanceProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Nav />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/converter" element={<CurrencyConverter />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </FinanceProvider>
  )
}
