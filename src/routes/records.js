const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Apply auth middleware
router.use(auth);

// Helper function to format records
const formatRecords = (rows) => {
  return rows.map(row => ({
    ...row,
    category: row.category_name
  }));
};

// ─── GET /api/records ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const accountId = req.query.account_id; // optional
  try {
    let query = `
      SELECT r.*, c.name as category_name, c.type 
      FROM records r
      JOIN categories c ON r.category_id = c.id
      JOIN accounts a ON r.account_id = a.id
      WHERE a.user_id = ? AND r.time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;
    const params = [req.user.id];

    if (accountId) {
      query += ` AND r.account_id = ?`;
      params.push(accountId);
    }
    query += ` ORDER BY r.time DESC`;

    const [rows] = await pool.query(query, params);
    res.json(formatRecords(rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/records/all ────────────────────────────────────────────────────
router.get('/all', async (req, res) => {
  const accountId = req.query.account_id;
  try {
    let query = `
      SELECT r.*, c.name as category_name, c.type 
      FROM records r
      JOIN categories c ON r.category_id = c.id
      JOIN accounts a ON r.account_id = a.id
      WHERE a.user_id = ?
    `;
    const params = [req.user.id];

    if (accountId) {
      query += ` AND r.account_id = ?`;
      params.push(accountId);
    }
    query += ` ORDER BY r.time DESC`;

    const [rows] = await pool.query(query, params);
    res.json(formatRecords(rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/records/balance ─────────────────────────────────────────────
// Returns total balance across all accounts for the user
router.get('/balance', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT SUM(balance) as total_balance FROM accounts WHERE user_id = ?`,
      [req.user.id]
    );
    const balance = rows[0].total_balance || 0;
    res.json({ balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/records ───────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { amount, category_id, account_id } = req.body;

  if (!amount || !category_id || !account_id) {
    return res.status(400).json({ error: 'amount, category_id, and account_id are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Verify account ownership
    const [accounts] = await connection.query(
      'SELECT balance FROM accounts WHERE id = ? AND user_id = ?',
      [account_id, req.user.id]
    );

    if (accounts.length === 0) {
      throw new Error('Account not found or unauthorized');
    }

    // Verify category ownership and get type
    const [categories] = await connection.query(
      'SELECT type FROM categories WHERE id = ? AND user_id = ?',
      [category_id, req.user.id]
    );

    if (categories.length === 0) {
      throw new Error('Category not found or unauthorized');
    }

    const type = categories[0].type;
    const currentBal = parseFloat(accounts[0].balance);
    const parsedAmount = parseFloat(amount);

    const newBal = type === 'income'
      ? currentBal + parsedAmount
      : currentBal - parsedAmount;

    // Update account balance
    await connection.query(
      'UPDATE accounts SET balance = ? WHERE id = ?',
      [newBal, account_id]
    );

    // Insert record
    const [result] = await connection.query(
      `INSERT INTO records (account_id, category_id, amount, time, bal)
       VALUES (?, ?, ?, NOW(), ?)`,
      [account_id, category_id, parsedAmount, newBal]
    );

    await connection.commit();
    res.status(201).json({ id: result.insertId, bal: newBal });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// ─── PUT /api/records/:id ────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { amount, category_id } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Fetch the record being edited (JOIN with categories to get current type)
    const [target] = await connection.query(
      `SELECT r.*, c.type 
       FROM records r
       JOIN categories c ON r.category_id = c.id
       JOIN accounts a ON r.account_id = a.id
       WHERE r.id = ? AND a.user_id = ?`,
      [id, req.user.id]
    );

    if (target.length === 0) {
      throw new Error('Record not found or unauthorized');
    }

    const oldRecord = target[0];
    const oldAmount = parseFloat(oldRecord.amount);
    const oldType = oldRecord.type;
    
    const newAmount = parseFloat(amount || oldAmount);
    const newCategoryId = category_id || oldRecord.category_id;
    const accountId = oldRecord.account_id;

    // Fetch new type if category changed
    let newType = oldType;
    if (category_id && category_id !== oldRecord.category_id) {
      const [newCats] = await connection.query(
        'SELECT type FROM categories WHERE id = ? AND user_id = ?',
        [category_id, req.user.id]
      );
      if (newCats.length === 0) throw new Error('New category not found or unauthorized');
      newType = newCats[0].type;
    }

    // Fetch current account balance
    const [accounts] = await connection.query(
      'SELECT balance FROM accounts WHERE id = ?',
      [accountId]
    );
    let accountBal = parseFloat(accounts[0].balance);

    // Reverse old record effect
    accountBal = oldType === 'income'
      ? accountBal - oldAmount
      : accountBal + oldAmount;

    // Apply new record effect
    accountBal = newType === 'income'
      ? accountBal + newAmount
      : accountBal - newAmount;

    // Update account
    await connection.query(
      'UPDATE accounts SET balance = ? WHERE id = ?',
      [accountBal, accountId]
    );

    // Update record
    await connection.query(
      `UPDATE records SET amount = ?, category_id = ?, bal = ? WHERE id = ?`,
      [newAmount, newCategoryId, accountBal, id]
    );

    await connection.commit();
    res.json({ success: true, bal: accountBal });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// ─── DELETE /api/records/:id ──────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Fetch the record (JOIN with categories to get type)
    const [target] = await connection.query(
      `SELECT r.*, c.type 
       FROM records r
       JOIN categories c ON r.category_id = c.id
       JOIN accounts a ON r.account_id = a.id
       WHERE r.id = ? AND a.user_id = ?`,
      [id, req.user.id]
    );

    if (target.length === 0) {
      throw new Error('Record not found or unauthorized');
    }

    const oldRecord = target[0];
    const accountId = oldRecord.account_id;
    const amount = parseFloat(oldRecord.amount);
    const type = oldRecord.type;

    // Fetch current account balance
    const [accounts] = await connection.query(
      'SELECT balance FROM accounts WHERE id = ?',
      [accountId]
    );

    let accountBal = parseFloat(accounts[0].balance);

    // Reverse record effect
    accountBal = type === 'income'
      ? accountBal - amount
      : accountBal + amount;

    // Update account
    await connection.query(
      'UPDATE accounts SET balance = ? WHERE id = ?',
      [accountBal, accountId]
    );

    // Delete record
    await connection.query(`DELETE FROM records WHERE id = ?`, [id]);

    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
