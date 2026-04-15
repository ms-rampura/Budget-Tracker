const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// ─── GET /api/records ───────────────────────────────────────────────────────
// Returns the last 30 days of records, newest first.
// Replaces: fetchRecords() in budgetContext
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM records
       WHERE time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       ORDER BY time DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/records/all ────────────────────────────────────────────────────
// Returns ALL records.
// Replaces: fetchAllRecords() in budgetContext
router.get('/all', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM records ORDER BY time DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/records/balance ─────────────────────────────────────────────
// Returns the current balance (the `bal` of the most recent record).
// Replaces: the balance derived from records in budgetContext
router.get('/balance', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT bal FROM records ORDER BY time DESC LIMIT 1`
    );
    const balance = rows.length > 0 ? rows[0].bal : 0;
    res.json({ balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/records ───────────────────────────────────────────────────────
// Adds a new transaction.
// Replaces: addRecords() in budgetContext
// Body: { amount, type, category }
router.post('/', async (req, res) => {
  const { amount, type, category } = req.body;

  if (!amount || !type || !category) {
    return res.status(400).json({ error: 'amount, type, and category are required' });
  }

  try {
    // Get the current balance from the last record
    const [lastRow] = await pool.query(
      `SELECT bal FROM records ORDER BY time DESC LIMIT 1`
    );
    const currentBal = lastRow.length > 0 ? lastRow[0].bal : 0;
    const newBal = type === 'income'
      ? currentBal + amount
      : currentBal - amount;

    const [result] = await pool.query(
      `INSERT INTO records (amount, type, category, time, bal)
       VALUES (?, ?, ?, NOW(), ?)`,
      [amount, type, category, newBal]
    );

    res.status(201).json({ id: result.insertId, bal: newBal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/records/:id ────────────────────────────────────────────────────
// Updates an existing record.
// Replaces: updateRecord() in budgetContext
// Body: { amount, type, category }
router.put('/:id', async (req, res) => {
  const { id }                     = req.params;
  const { amount, type, category } = req.body;

  try {
    // Fetch the record being edited
    const [target] = await pool.query(`SELECT * FROM records WHERE id = ?`, [id]);
    if (target.length === 0) return res.status(404).json({ error: 'Record not found' });

    // Get the balance just BEFORE this record
    const [prev] = await pool.query(
      `SELECT bal FROM records WHERE time < ? ORDER BY time DESC LIMIT 1`,
      [target[0].time]
    );
    const balBefore = prev.length > 0 ? prev[0].bal : 0;

    // Recalculate the balance for this record with the new values
    const updatedBal = type === 'income'
      ? balBefore + amount
      : balBefore - amount;

    await pool.query(
      `UPDATE records SET amount = ?, type = ?, category = ?, bal = ? WHERE id = ?`,
      [amount, type, category, updatedBal, id]
    );

    res.json({ success: true, bal: updatedBal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/records/:id ──────────────────────────────────────────────────
// Deletes a record.
// Replaces: deleteRecord() in budgetContext
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(`DELETE FROM records WHERE id = ?`, [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
