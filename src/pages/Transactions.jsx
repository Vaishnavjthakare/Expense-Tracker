import { useEffect, useState } from 'react';
import { useTransactions } from '../context/TransactionContext.jsx';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { HiTrash } from 'react-icons/hi';

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export default function Transactions() {
  const { transactions, loading, fetchTransactions, refreshAllData, deleteTransaction } = useTransactions();
  const [typeFilter, setTypeFilter] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const filters = {};
    if (typeFilter) filters.type = typeFilter;
    fetchTransactions(filters).then(() => setLoaded(true));
  }, [typeFilter]);

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      toast.success('Deleted!');
      refreshAllData();
    } catch (err) { 
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to delete'); 
    }
  };

  if (!loaded) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>Transactions</motion.h2>
        <p>View and manage all your transactions</p>
      </div>

      <div className="filter-bar">
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {transactions.length > 0 ? (
          <table className="txn-table">
            <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th><th></th></tr></thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t._id}>
                  <td>{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>{t.description || '—'}</td>
                  <td><span className="txn-category">{t.category}</span></td>
                  <td style={{ textTransform: 'capitalize' }}>{t.type}</td>
                  <td className={`txn-amount ${t.type}`}>{t.type === 'income' ? '+' : '-'}{fmt(t.amount)}</td>
                  <td><button className="txn-delete" onClick={() => handleDelete(t._id)}><HiTrash /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state"><h3>No transactions found</h3><p>Start by adding your first transaction.</p></div>
        )}
      </motion.div>
    </div>
  );
}
