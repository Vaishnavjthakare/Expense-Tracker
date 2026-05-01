import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineUpload, HiOutlineDocumentText, HiOutlineSparkles, HiOutlineX } from 'react-icons/hi';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import CountUp from './CountUp.jsx';

const COLORS = ['#10b981', '#eab308', '#ec4899', '#f97316', '#06b6d4'];

export default function AIAssistant({ summary }) {
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [report, setReport] = useState(null);

  const handleUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    setScanning(true);

    setTimeout(() => {
      setScanning(false);
      
      // Mock Student Financial Data
      const studentAllocation = [
        { name: 'Rent/Hostel', value: 5000 },
        { name: 'Food/Mess', value: 4000 },
        { name: 'Books/Fees', value: 2000 },
        { name: 'Misc/Fun', value: 2500 },
        { name: 'Savings', value: 1500 }
      ];

      const monthlyTrend = [
        { month: 'Jan', income: 15000, expense: 14000 },
        { month: 'Feb', income: 15000, expense: 13800 },
        { month: 'Mar', income: 15000, expense: 14200 },
        { month: 'Apr', income: 15000, expense: 13500 },
      ];

      const totalIncome = summary?.totalIncome || 15000;
      const totalExpense = summary?.totalExpense || 13500;
      const totalSavings = totalIncome - totalExpense;
      
      setReport({
        fileName: uploadedFile.name,
        insights: [
          `Detected student allowance/income of ₹${totalIncome.toLocaleString('en-IN')}/month.`,
          `Current monthly expenditure is ₹${totalExpense.toLocaleString('en-IN')}.`,
          `You are saving exactly 10% (₹${totalSavings.toLocaleString('en-IN')}) of your income this month.`
        ],
        advice: totalSavings > 0 
          ? `Great job! You saved ₹${totalSavings.toLocaleString('en-IN')} this month. Try to invest 50% of this into a high-interest savings account.` 
          : "Your expenses are higher than your income. Consider reducing your 'Misc/Fun' or 'Food' budget to avoid debt.",
        allocation: studentAllocation,
        trend: monthlyTrend,
        totals: { income: totalIncome, expense: totalExpense, savings: totalSavings }
      });
    }, 3000);
  };

  return (
    <div className="glass-card ai-assistant-card" style={{ marginBottom: '40px' }}>
      <div className="ai-glow"></div>
      
      <div className="card-header border-bottom">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)' }}>
          <HiOutlineSparkles /> AI Student Financial Analyst
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', fontWeight: 'normal' }}>
          Upload your student income sheet or bank PDF. Our AI will analyze your income streams and generate visual reports.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!file && !report && (
          <motion.div 
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ai-upload-zone"
          >
            <input type="file" accept=".pdf,.csv,.xlsx" onChange={handleUpload} className="ai-file-input" />
            <HiOutlineUpload style={{ fontSize: '40px', color: 'var(--text-muted)', marginBottom: '12px' }} />
            <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Click or drag a Student Income Sheet here</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Supported formats: PDF, CSV, Excel. Max 5MB.</p>
          </motion.div>
        )}

        {scanning && (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ai-scanning-state"
          >
            <div className="scanner-container">
              <HiOutlineDocumentText className="scanner-icon" />
              <motion.div 
                className="scanner-line"
                animate={{ y: [0, 100, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#eab308', marginBottom: '8px' }}>Analyzing Income Streams...</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Reading student data from {file.name}</p>
          </motion.div>
        )}

        {report && (
          <motion.div 
            key="report"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="ai-report-grid"
            style={{ gridTemplateColumns: '1fr' }} // Make it single column to fit charts nicely
          >
            <button onClick={() => { setFile(null); setReport(null); }} className="ai-close-btn"><HiOutlineX /></button>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              
              {/* Left Column: Text Insights */}
              <div className="ai-report-left">
                <div className="ai-insight-box ai-advice">
                  <h4><HiOutlineSparkles /> AI Financial Advice</h4>
                  <p>{report.advice}</p>
                </div>

                <div className="ai-insight-box">
                  <h4>Extracted Insights</h4>
                  <ul>
                    {report.insights.map((insight, i) => (
                      <li key={i}><span>•</span> {insight}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: Graphs */}
              <div className="ai-report-right" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ color: '#fff', margin: 0 }}>Monthly Allocation (15k)</h4>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-green)' }}>
                    <CountUp prefix="₹" end={report.totals.savings} /> <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'normal' }}>Saved</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', height: '220px' }}>
                  {/* Pie Chart */}
                  <div style={{ height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={report.allocation} innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                          {report.allocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value) => `₹${value}`} 
                          contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} 
                          itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bar Chart Trend */}
                  <div style={{ height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={report.trend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                        <RechartsTooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} 
                        />
                        <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
