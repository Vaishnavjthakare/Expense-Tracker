import express from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/transactions — Get all transactions (with filters)
router.get('/', async (req, res) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 50 } = req.query;
    const filter = { user: req.userId };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ transactions, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/transactions/summary — Get financial summary
router.get('/summary', async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { user: req.userId };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const transactions = await Transaction.find(filter);
    
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
        incomeCount++;
      } else {
        totalExpense += t.amount;
        expenseCount++;
      }
    });

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      incomeCount,
      expenseCount,
      totalTransactions: incomeCount + expenseCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/transactions/category-summary — Category breakdown
router.get('/category-summary', async (req, res) => {
  try {
    const { type, month, year } = req.query;
    const filter = { user: req.userId };

    if (type) filter.type = type;
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const transactions = await Transaction.find(filter);
    const categoryMap = {};

    transactions.forEach(t => {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = { _id: t.category, total: 0, count: 0 };
      }
      categoryMap[t.category].total += t.amount;
      categoryMap[t.category].count++;
    });

    const result = Object.values(categoryMap).sort((a, b) => b.total - a.total);
    res.json({ categories: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/transactions/monthly-report — Monthly trends
router.get('/monthly-report', async (req, res) => {
  try {
    const { year } = req.query;
    const filter = { user: req.userId };

    if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const transactions = await Transaction.find(filter);
    
    // Group by month
    const months = {};
    transactions.forEach(t => {
      const d = new Date(t.date);
      const m = d.getMonth() + 1; // 1-12
      const y = d.getFullYear();
      const key = `${y}-${String(m).padStart(2, '0')}`;
      
      if (!months[key]) {
        months[key] = { month: m, year: y, income: 0, expense: 0 };
      }
      
      if (t.type === 'income') {
        months[key].income += t.amount;
      } else {
        months[key].expense += t.amount;
      }
    });

    const report = Object.values(months).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    res.json({ report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/transactions — Create a transaction
router.post('/', async (req, res) => {
  try {
    const { type, amount, category, description, date, tags } = req.body;

    const transaction = new Transaction({
      user: req.userId,
      type,
      amount,
      category,
      description,
      date: date || new Date(),
      tags: tags || []
    });

    await transaction.save();
    res.status(201).json({ transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/transactions/:id — Update a transaction
router.put('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/transactions/:id — Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
