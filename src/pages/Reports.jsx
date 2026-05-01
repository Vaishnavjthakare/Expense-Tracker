import { useEffect, useState } from 'react';
import { useTransactions } from '../context/TransactionContext.jsx';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import CountUp from '../components/CountUp.jsx';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#10b981','#eab308','#ec4899','#f97316','#06b6d4','#6366f1','#84cc16','#ef4444','#f43f5e'];
const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const tooltipStyle = { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' };

export default function Reports() {
  const { monthlyReport, fetchMonthlyReport, categorySummary, summary, transactions, fetchCategorySummary, fetchSummary, fetchTransactions } = useTransactions();
  const [year, setYear] = useState(new Date().getFullYear());
  const [viewType, setViewType] = useState('expense');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchMonthlyReport(year),
      fetchCategorySummary(viewType),
      fetchSummary(),
      fetchTransactions()
    ]).then(() => setLoaded(true));
  }, [year, viewType]);

  const data = (monthlyReport || []).map(m => ({
    name: MONTHS[m.month - 1],
    income: m.income || 0,
    expense: m.expense || 0,
    savings: (m.income || 0) - (m.expense || 0)
  }));

  const totals = data.reduce((acc, m) => ({
    income: acc.income + m.income,
    expense: acc.expense + m.expense,
    savings: acc.savings + m.savings
  }), { income: 0, expense: 0, savings: 0 });

  const avgMonthlyExpense = data.length > 0 ? totals.expense / data.length : 0;
  const savingsRate = totals.income > 0 ? ((totals.savings / totals.income) * 100).toFixed(1) : 0;

  // Category Data
  const totalCatAmount = (categorySummary || []).reduce((s, c) => s + c.total, 0);
  const pieData = (categorySummary || []).map(c => ({ name: c._id, value: c.total }));

  if (!loaded) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>Monthly Reports</motion.h2>
        <p>Track your financial trends over time</p>
      </div>

      {/* Year Filter */}
      <div className="filter-bar">
        <select value={year} onChange={e => setYear(Number(e.target.value))}>
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <motion.div className="stat-card income" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-label">Year Income</div>
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{fmt(totals.income)}</div>
        </motion.div>
        <motion.div className="stat-card expense" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="stat-label">Year Expenses</div>
          <div className="stat-value" style={{ color: 'var(--accent-red)' }}>{fmt(totals.expense)}</div>
        </motion.div>
        <motion.div className="stat-card balance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="stat-label">Year Savings</div>
          <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{fmt(totals.savings)}</div>
          <div className="stat-count">Savings rate: {savingsRate}%</div>
        </motion.div>
        <motion.div className="stat-card balance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="stat-label">Avg Monthly Expense</div>
          <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>{fmt(avgMonthlyExpense)}</div>
        </motion.div>
      </div>

      {/* Bar Chart: Income vs Expense */}
      <motion.div className="glass-card chart-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="card-header"><h3>Income vs Expenses ({year})</h3></div>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} />
              <RechartsTooltip formatter={v => fmt(v)} contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" radius={[4,4,0,0]} name="Income" />
              <Bar dataKey="expense" fill="#ef4444" radius={[4,4,0,0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="empty-state"><p>No data for {year}</p></div>}
      </motion.div>

      {/* Savings Trend */}
      <motion.div className="glass-card chart-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div className="card-header"><h3>Savings Trend ({year})</h3></div>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} />
              <RechartsTooltip formatter={v => fmt(v)} contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="savings" stroke="var(--accent-green)" fill="url(#savingsGrad)" strokeWidth={2} name="Monthly Savings" />
            </AreaChart>
          </ResponsiveContainer>
        ) : <div className="empty-state"><p>No data for {year}</p></div>}
      </motion.div>

      {/* Category Analysis Grid */}
      <div className="chart-row" style={{ marginTop: '32px' }}>
        {/* Pie Chart */}
        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Category Distribution</h3>
            <select value={viewType} onChange={e => setViewType(e.target.value)} style={{ padding: '4px 8px', fontSize: '12px' }}>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={110} paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip formatter={v => fmt(v)} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No data available</p></div>}
        </motion.div>

        {/* Category Cards */}
        <div className="glass-card" style={{ overflowY: 'auto', maxHeight: '400px' }}>
          <div className="card-header"><h3>Breakdown Details</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(categorySummary || []).map((cat, i) => (
              <div key={cat._id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600' }}>{cat._id}</span>
                  <span style={{ color: viewType === 'income' ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: '700' }}>{fmt(cat.total)}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${totalCatAmount > 0 ? (cat.total / totalCatAmount * 100) : 0}%`, background: COLORS[i % COLORS.length] }} />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  {cat.count} transactions • {totalCatAmount > 0 ? (cat.total / totalCatAmount * 100).toFixed(1) : 0}%
                </div>
              </div>
            ))}
            {(!categorySummary || categorySummary.length === 0) && (
              <div className="empty-state"><p>No categories found.</p></div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ marginTop: '32px' }}>
        <div className="card-header"><h3>Monthly Breakdown</h3></div>
        {data.length > 0 ? (
          <table className="txn-table">
            <thead><tr><th>Month</th><th>Income</th><th>Expenses</th><th>Savings</th></tr></thead>
            <tbody>
              {data.map(m => (
                <tr key={m.name}>
                  <td style={{ fontWeight: 600 }}>{m.name}</td>
                  <td className="txn-amount income">+{fmt(m.income)}</td>
                  <td className="txn-amount expense">-{fmt(m.expense)}</td>
                  <td style={{ color: m.savings >= 0 ? 'var(--accent-blue)' : 'var(--accent-red)', fontWeight: 600 }}>{fmt(m.savings)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid var(--border-glass)' }}>
                <td style={{ fontWeight: 800 }}>Total</td>
                <td className="txn-amount income" style={{ fontWeight: 800 }}>+{fmt(totals.income)}</td>
                <td className="txn-amount expense" style={{ fontWeight: 800 }}>-{fmt(totals.expense)}</td>
                <td style={{ color: totals.savings >= 0 ? 'var(--accent-blue)' : 'var(--accent-red)', fontWeight: 800 }}>{fmt(totals.savings)}</td>
              </tr>
            </tbody>
          </table>
        ) : <div className="empty-state"><p>No data for {year}</p></div>}
      </motion.div>

      {/* Added Data: Recent Transactions List */}
      <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ marginTop: '32px' }}>
        <div className="card-header"><h3>Recent Activity (Added Data)</h3></div>
        {(transactions || []).length > 0 ? (
          <table className="txn-table">
            <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead>
            <tbody>
              {transactions.slice(0, 10).map(t => (
                <tr key={t._id}>
                  <td>{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                  <td>{t.description || '—'}</td>
                  <td><span className="txn-category">{t.category}</span></td>
                  <td className={`txn-amount ${t.type}`}>{t.type === 'income' ? '+' : '-'}{fmt(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="empty-state"><p>No transactions added yet.</p></div>}
      </motion.div>
    </div>
  );
}
