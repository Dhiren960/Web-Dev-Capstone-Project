import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { format } from 'date-fns'

const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', color: '#ffb84d', icon: '🍜' },
  { id: 'transport', label: 'Transport', color: '#5c9dff', icon: '🚗' },
  { id: 'shopping', label: 'Shopping', color: '#ff6eb3', icon: '🛍️' },
  { id: 'health', label: 'Health', color: '#4dffcc', icon: '💊' },
  { id: 'entertainment', label: 'Entertainment', color: '#a78bfa', icon: '🎮' },
  { id: 'bills', label: 'Bills & Utilities', color: '#ff5c5c', icon: '⚡' },
  { id: 'education', label: 'Education', color: '#c8f542', icon: '📚' },
  { id: 'other', label: 'Other', color: '#8b90a0', icon: '📦' },
]

const SEED_EXPENSES = [
  { id: '1', title: 'Grocery Shopping', amount: 2400, category: 'food', date: format(new Date(2025, 3, 1), 'yyyy-MM-dd'), note: 'Weekly groceries' },
  { id: '2', title: 'Metro Card', amount: 1500, category: 'transport', date: format(new Date(2025, 3, 3), 'yyyy-MM-dd'), note: '' },
  { id: '3', title: 'Netflix', amount: 649, category: 'entertainment', date: format(new Date(2025, 3, 5), 'yyyy-MM-dd'), note: 'Monthly sub' },
  { id: '4', title: 'Electricity Bill', amount: 3200, category: 'bills', date: format(new Date(2025, 3, 7), 'yyyy-MM-dd'), note: '' },
  { id: '5', title: 'Restaurant Dinner', amount: 1800, category: 'food', date: format(new Date(2025, 3, 10), 'yyyy-MM-dd'), note: 'Date night' },
  { id: '6', title: 'Udemy Course', amount: 499, category: 'education', date: format(new Date(2025, 3, 12), 'yyyy-MM-dd'), note: 'React masterclass' },
  { id: '7', title: 'Pharmacy', amount: 850, category: 'health', date: format(new Date(2025, 3, 14), 'yyyy-MM-dd'), note: '' },
  { id: '8', title: 'Amazon Purchase', amount: 3400, category: 'shopping', date: format(new Date(2025, 3, 16), 'yyyy-MM-dd'), note: 'Books and gadgets' },
  { id: '9', title: 'Auto Rickshaw', amount: 320, category: 'transport', date: format(new Date(2025, 3, 18), 'yyyy-MM-dd'), note: '' },
  { id: '10', title: 'Coffee Shop', amount: 560, category: 'food', date: format(new Date(2025, 3, 20), 'yyyy-MM-dd'), note: '' },
  { id: '11', title: 'Gym Membership', amount: 2000, category: 'health', date: format(new Date(2025, 3, 22), 'yyyy-MM-dd'), note: 'Monthly' },
  { id: '12', title: 'New Headphones', amount: 4500, category: 'shopping', date: format(new Date(2025, 3, 25), 'yyyy-MM-dd'), note: '' },
  { id: '13', title: 'Pizza Night', amount: 950, category: 'food', date: format(new Date(2025, 3, 27), 'yyyy-MM-dd'), note: '' },
  { id: '14', title: 'Internet Bill', amount: 1199, category: 'bills', date: format(new Date(2025, 3, 28), 'yyyy-MM-dd'), note: '' },
  { id: '15', title: 'Movie Tickets', amount: 700, category: 'entertainment', date: format(new Date(2025, 2, 5), 'yyyy-MM-dd'), note: '' },
  { id: '16', title: 'Grocery Shopping', amount: 2100, category: 'food', date: format(new Date(2025, 2, 10), 'yyyy-MM-dd'), note: '' },
  { id: '17', title: 'Bus Pass', amount: 1200, category: 'transport', date: format(new Date(2025, 2, 12), 'yyyy-MM-dd'), note: '' },
  { id: '18', title: 'Doctor Visit', amount: 600, category: 'health', date: format(new Date(2025, 2, 15), 'yyyy-MM-dd'), note: '' },
  { id: '19', title: 'Electricity Bill', amount: 2900, category: 'bills', date: format(new Date(2025, 2, 18), 'yyyy-MM-dd'), note: '' },
  { id: '20', title: 'Flipkart Order', amount: 1800, category: 'shopping', date: format(new Date(2025, 2, 22), 'yyyy-MM-dd'), note: '' },
]

const FinanceContext = createContext(null)

const initialState = {
  expenses: JSON.parse(localStorage.getItem('ff_expenses') || 'null') || SEED_EXPENSES,
  budget: JSON.parse(localStorage.getItem('ff_budget') || '25000'),
  currency: localStorage.getItem('ff_currency') || 'INR',
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] }
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) }
    case 'EDIT_EXPENSE':
      return { ...state, expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e) }
    case 'SET_BUDGET':
      return { ...state, budget: action.payload }
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload }
    default:
      return state
  }
}

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    localStorage.setItem('ff_expenses', JSON.stringify(state.expenses))
  }, [state.expenses])

  useEffect(() => {
    localStorage.setItem('ff_budget', JSON.stringify(state.budget))
  }, [state.budget])

  useEffect(() => {
    localStorage.setItem('ff_currency', state.currency)
  }, [state.currency])

  const addExpense = (expense) => dispatch({ type: 'ADD_EXPENSE', payload: { ...expense, id: Date.now().toString() } })
  const deleteExpense = (id) => dispatch({ type: 'DELETE_EXPENSE', payload: id })
  const editExpense = (expense) => dispatch({ type: 'EDIT_EXPENSE', payload: expense })
  const setBudget = (budget) => dispatch({ type: 'SET_BUDGET', payload: budget })
  const setCurrency = (currency) => dispatch({ type: 'SET_CURRENCY', payload: currency })

  return (
    <FinanceContext.Provider value={{ ...state, addExpense, deleteExpense, editExpense, setBudget, setCurrency, CATEGORIES }}>
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => useContext(FinanceContext)
export { CATEGORIES }
