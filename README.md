# FinFlow — Personal Finance Tracker

A production-grade personal finance tracker built with React + Vite.

## Features

- **Dashboard** — Monthly stats, budget progress bar, category breakdown, recent transactions
- **Expenses** — Full CRUD with search, filter by category, sort, and pagination
- **Analytics** — 6-month bar chart, category pie chart, weekly breakdown with Recharts
- **Currency Converter** — Live exchange rates via ExchangeRate-API (API key embedded)

## Tech Stack

- React 18 + Vite
- React Router v6
- Context API (no Redux needed for this scale)
- Recharts for charts
- date-fns for date manipulation
- CSS custom properties for theming

## API

Uses **ExchangeRate-API v6** for live currency conversion:
- Endpoint: `https://v6.exchangerate-api.com/v6/{API_KEY}/latest/{BASE}`
- Key: `9b64e1a1b5e730d321ede941`
- Debounced calls on input change
- Conversion history tracked in state

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for Production

```bash
npm run build
npm run preview
```

## Deploy to Vercel / Netlify

Just connect the repo or drag the `dist/` folder to Netlify.

## Project Structure

```
src/
├── context/
│   └── FinanceContext.jsx   # Global state (expenses, budget, currency)
├── pages/
│   ├── Dashboard.jsx        # Overview + stats
│   ├── Expenses.jsx         # CRUD table with filters
│   ├── Analytics.jsx        # Charts & monthly analytics
│   └── CurrencyConverter.jsx # Live API converter ← CORE FEATURE
├── components/
│   └── ExpenseModal.jsx     # Add/Edit expense modal
├── App.jsx                  # Router + sidebar nav
└── index.css                # Global design tokens
```
