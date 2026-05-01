import { useState, useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext.jsx';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX, HiChevronLeft, HiChevronRight } from 'react-icons/hi';

export default function AddTransaction() {
  const { addTransaction, transactions, fetchTransactions, fetchSummary, refreshAllData } = useTransactions();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');

  const categories = {
    expense: ['Food', 'Transport', 'Utilities', 'Shopping', 'Entertainment', 'Healthcare', 'Housing', 'Other'],
    income: ['Salary', 'Freelance', 'Investments', 'Business', 'Other']
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Map transactions to dates for the current month
  const transactionsByDate = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = { income: 0, expense: 0 };
        map[day][t.type] += t.amount;
      }
    });
    return map;
  }, [transactions, year, month]);

  const openModalForDate = (day, defaultType = 'expense') => {
    // Format date to YYYY-MM-DD for the input
    const d = day ? new Date(year, month, day) : new Date();
    // Adjust for local timezone offset to prevent date shifting
    const offset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d - offset)).toISOString().split('T')[0];
    
    setSelectedDate(localISOTime);
    setType(defaultType);
    setCategory(defaultType === 'expense' ? 'Food' : 'Salary');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || !selectedDate) return toast.error('Please fill all fields');
    
    const success = await addTransaction({
      description: title,
      amount: Number(amount),
      type,
      category,
      date: selectedDate
    });

    if (success) {
      toast.success('Transaction added');
      setTitle('');
      setAmount('');
      setIsModalOpen(false);
      
      // Refresh global state so Dashboard, Transactions, and Reports update instantly
      refreshAllData();
    }
  };

  // Generate calendar grid
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="cal-day empty"></div>);
  for (let d = 1; d <= daysInMonth; d++) {
    const dayData = transactionsByDate[d];
    days.push(
      <motion.div 
        key={d} 
        className="cal-day"
        whileHover={{ scale: 1.02, backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
      >
        <div className="cal-day-top">
          <span className="day-number">{d}</span>
          <div className="cal-quick-actions">
            <button onClick={(e) => { e.stopPropagation(); openModalForDate(d, 'income'); }} className="quick-add-btn inc" title="Add Income">+</button>
            <button onClick={(e) => { e.stopPropagation(); openModalForDate(d, 'expense'); }} className="quick-add-btn exp" title="Add Expense">-</button>
          </div>
        </div>
        
        {dayData ? (
          <div className="day-stats" onClick={() => openModalForDate(d)}>
            {dayData.income > 0 && <div className="day-chip income-chip">+ ₹{dayData.income}</div>}
            {dayData.expense > 0 && <div className="day-chip expense-chip">- ₹{dayData.expense}</div>}
          </div>
        ) : (
          <div className="day-stats-empty" onClick={() => openModalForDate(d)}></div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="calendar-page"
    >
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Transaction Calendar</h2>
          <p>Select a date or use the buttons to add records</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => openModalForDate(null, 'income')} className="global-add-btn global-income">
            <span className="icon">📈</span> Add Income
          </button>
          <button onClick={() => openModalForDate(null, 'expense')} className="global-add-btn global-expense">
            <span className="icon">📉</span> Add Expense
          </button>
        </div>
      </div>

      <div className="glass-card calendar-container">
        <div className="calendar-header">
          <button onClick={prevMonth} className="cal-nav-btn"><HiChevronLeft /></button>
          <h3>{monthNames[month]} {year}</h3>
          <button onClick={nextMonth} className="cal-nav-btn"><HiChevronRight /></button>
        </div>

        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="cal-day-name">{day}</div>
          ))}
          {days}
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div 
              className="glass-card modal-content"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <button className="modal-close" onClick={() => setIsModalOpen(false)}><HiOutlineX /></button>
              
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '800', background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
                  Add Transaction
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                  {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="transaction-form">
                <div className="type-toggle" style={{ gridColumn: '1 / -1' }}>
                  <button type="button" className={`type-btn ${type === 'expense' ? 'active expense-btn' : ''}`} onClick={() => { setType('expense'); setCategory('Food'); }}>
                    📉 Expense
                  </button>
                  <button type="button" className={`type-btn ${type === 'income' ? 'active income-btn' : ''}`} onClick={() => { setType('income'); setCategory('Salary'); }}>
                    📈 Income
                  </button>
                </div>

                <div className="form-group">
                  <label>Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Groceries" required />
                </div>

                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {categories[type].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Date</label>
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} required />
                </div>

                <button type="submit" className="submit-btn" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                  Add {type === 'income' ? 'Income' : 'Expense'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
