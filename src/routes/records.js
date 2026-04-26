const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');

// Apply auth middleware
router.use(auth);

// ─── GET /api/records ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const accountId = req.query.account_id; // optional
  try {
    let query = `SELECT * FROM records WHERE user_id = ? AND time >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
    const params = [req.user.id];

    if (accountId) {
      query += ` AND account_id = ?`;
      params.push(accountId);
    }
    query += ` ORDER BY time DESC`;

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/records/all ────────────────────────────────────────────────────
router.get('/all', async (req, res) => {
  const accountId = req.query.account_id;
  try {
    let query = `SELECT * FROM records WHERE user_id = ?`;
    const params = [req.user.id];

    if (accountId) {
      query += ` AND account_id = ?`;
      params.push(accountId);
    }
    query += ` ORDER BY time DESC`;

    const [rows] = await pool.query(query, params);
    res.json(rows);
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
  const { amount, type, category, account_id } = req.body;

  if (!amount || !type || !category || !account_id) {
    return res.status(400).json({ error: 'amount, type, category, and account_id are required' });
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
      `INSERT INTO records (user_id, account_id, amount, type, category, time, bal)
       VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
      [req.user.id, account_id, parsedAmount, type, category, newBal]
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
  const { amount, type, category } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Fetch the record being edited
    const [target] = await connection.query(
      `SELECT * FROM records WHERE id = ? AND user_id = ?`, 
      [id, req.user.id]
    );
    
    if (target.length === 0) {
      throw new Error('Record not found or unauthorized');
    }

    const oldRecord = target[0];
    const oldAmount = parseFloat(oldRecord.amount);
    const newAmount = parseFloat(amount || oldAmount);
    const newType = type || oldRecord.type;
    const accountId = oldRecord.account_id;

    // Fetch current account balance
    const [accounts] = await connection.query(
      'SELECT balance FROM accounts WHERE id = ?',
      [accountId]
    );
    let accountBal = parseFloat(accounts[0].balance);

    // Reverse old record effect
    accountBal = oldRecord.type === 'income'
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
      `UPDATE records SET amount = ?, type = ?, category = ?, bal = ? WHERE id = ?`,
      [newAmount, newType, category || oldRecord.category, accountBal, id]
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

    // Fetch the record
    const [target] = await connection.query(
      `SELECT * FROM records WHERE id = ? AND user_id = ?`, 
      [id, req.user.id]
    );
    
    if (target.length === 0) {
      throw new Error('Record not found or unauthorized');
    }

    const oldRecord = target[0];
    const accountId = oldRecord.account_id;
    const amount = parseFloat(oldRecord.amount);

    // Fetch current account balance
    const [accounts] = await connection.query(
      'SELECT balance FROM accounts WHERE id = ?',
      [accountId]
    );
    
    let accountBal = parseFloat(accounts[0].balance);

    // Reverse record effect
    accountBal = oldRecord.type === 'income'
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
