import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';

const TransactionContext = createContext(null);
const API = '/api/transactions';

export function TransactionProvider({ children }) {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categorySummary, setCategorySummary] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [loading, setLoading] = useState(false);

  // Use a ref so callbacks always read the latest token
  const tokenRef = useRef(token);
  useEffect(() => { tokenRef.current = token; }, [token]);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${tokenRef.current}`
  });

  const fetchTransactions = useCallback(async (filters = {}) => {
    if (!tokenRef.current) return;
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await fetch(`${API}?${params}`, { headers: getHeaders() });
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('fetchTransactions error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async (month, year) => {
    if (!tokenRef.current) return;
    try {
      const params = month && year ? `?month=${month}&year=${year}` : '';
      const res = await fetch(`${API}/summary${params}`, { headers: getHeaders() });
      const data = await res.json();
      setSummary(data);
      return data;
    } catch (err) {
      console.error('fetchSummary error:', err);
    }
  }, []);

  const fetchCategorySummary = useCallback(async (type, month, year) => {
    if (!tokenRef.current) return;
    try {
      const params = new URLSearchParams();
      if (type) params.set('type', type);
      if (month) params.set('month', month);
      if (year) params.set('year', year);
      const res = await fetch(`${API}/category-summary?${params}`, { headers: getHeaders() });
      const data = await res.json();
      setCategorySummary(data.categories || []);
      return data;
    } catch (err) {
      console.error('fetchCategorySummary error:', err);
    }
  }, []);

  const fetchMonthlyReport = useCallback(async (year) => {
    if (!tokenRef.current) return;
    try {
      const params = year ? `?year=${year}` : '';
      const res = await fetch(`${API}/monthly-report${params}`, { headers: getHeaders() });
      const data = await res.json();
      setMonthlyReport(data.report || []);
      return data;
    } catch (err) {
      console.error('fetchMonthlyReport error:', err);
    }
  }, []);

  const addTransaction = useCallback(async (txn) => {
    const res = await fetch(API, { method: 'POST', headers: getHeaders(), body: JSON.stringify(txn) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.transaction;
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to delete');
  }, []);

  const refreshAllData = useCallback(async () => {
    await Promise.all([
      fetchTransactions(),
      fetchSummary(),
      fetchCategorySummary('expense'),
      fetchMonthlyReport(new Date().getFullYear())
    ]);
  }, [fetchTransactions, fetchSummary, fetchCategorySummary, fetchMonthlyReport]);

  return (
    <TransactionContext.Provider value={{
      transactions, summary, categorySummary, monthlyReport, loading,
      fetchTransactions, fetchSummary, fetchCategorySummary, fetchMonthlyReport,
      addTransaction, deleteTransaction, refreshAllData
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export const useTransactions = () => useContext(TransactionContext);
