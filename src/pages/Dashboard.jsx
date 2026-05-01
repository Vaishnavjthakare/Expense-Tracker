import { useEffect, useState } from 'react';
import { useTransactions } from '../context/TransactionContext.jsx';
import { HiTrendingUp, HiTrendingDown, HiCash } from 'react-icons/hi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import CountUp from '../components/CountUp.jsx';
import AIAssistant from '../components/AIAssistant.jsx';

const COLORS = ['#10b981', '#eab308', '#ec4899', '#f97316', '#06b6d4', '#84cc16', '#ef4444', '#f43f5e'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export default function Dashboard() {
  const { summary, categorySummary, monthlyReport, transactions, fetchSummary, fetchCategorySummary, fetchMonthlyReport, fetchTransactions } = useTransactions();
  const [loaded, setLoaded] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    Promise.all([
      fetchSummary(),
      fetchCategorySummary('expense'),
      fetchMonthlyReport(year),
      fetchTransactions({ limit: 5 })
    ]).then(() => setLoaded(true));
  }, []);

  const pieData = (categorySummary || []).map(c => ({ name: c._id, value: c.total }));
  const barData = (monthlyReport || []).map(m => ({ name: MONTHS[m.month - 1], income: m.income, expense: m.expense }));

  if (!loaded) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>Dashboard</motion.h2>
        <p>Your financial overview at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <motion.div className="stat-card income" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-icon"><HiTrendingUp /></div>
          <div className="stat-label">Total Income</div>
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>
            <CountUp prefix="₹" end={summary?.totalIncome || 0} />
          </div>
          <div className="stat-count">{summary?.incomeCount || 0} transactions</div>
        </motion.div>
        <motion.div className="stat-card expense" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="stat-icon"><HiTrendingDown /></div>
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value" style={{ color: 'var(--accent-red)' }}>
            <CountUp prefix="₹" end={summary?.totalExpense || 0} />
          </div>
          <div className="stat-count">{summary?.expenseCount || 0} transactions</div>
        </motion.div>
        <motion.div className="stat-card balance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="stat-icon"><HiCash /></div>
          <div className="stat-label">Net Balance</div>
          <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>
            <CountUp prefix="₹" end={summary?.balance || 0} />
          </div>
          <div className="stat-count">{summary?.totalTransactions || 0} total</div>
        </motion.div>
      </div>

      {/* AI Assistant Section */}
      <div style={{ marginTop: '32px' }}>
        <AIAssistant summary={summary} />
      </div>

      {/* Charts Row */}
      <div className="chart-row">
        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="card-header"><h3>Expense Breakdown</h3></div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No expense data yet</p></div>}
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="card-header"><h3>Monthly Trends ({year})</h3></div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[4,4,0,0]} name="Income" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4,4,0,0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No monthly data yet</p></div>}
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <div className="card-header"><h3>Recent Transactions</h3></div>
        {transactions.length > 0 ? (
          <table className="txn-table">
            <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead>
            <tbody>
              {transactions.slice(0, 5).map(t => (
                <tr key={t._id}>
                  <td>{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                  <td>{t.description || '—'}</td>
                  <td><span className="txn-category">{t.category}</span></td>
                  <td className={`txn-amount ${t.type}`}>{t.type === 'income' ? '+' : '-'}{fmt(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="empty-state"><h3>No transactions yet</h3><p>Add your first transaction to get started!</p></div>}
      </motion.div>
    </motion.div>
  );
}
