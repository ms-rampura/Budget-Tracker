const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Apply auth middleware to all account routes
router.use(auth);

// ─── GET /api/accounts ────────────────────────────────────────────────────────
// Get all accounts for the logged-in user
router.get('/', async (req, res) => {
  try {
    const [accounts] = await pool.query(
      'SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at ASC',
      [req.user.id]
    );
    res.json(accounts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/accounts ───────────────────────────────────────────────────────
// Create a new account
router.post('/', async (req, res) => {
  const { name, type, initial_balance } = req.body;
  const balance = initial_balance || 0.00;

  if (!name) {
    return res.status(400).json({ error: 'Account name is required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO accounts (user_id, name, type, balance) VALUES (?, ?, ?, ?)',
      [req.user.id, name, type || 'general', balance]
    );
    
    // Fetch the newly created account to return
    const [newAccount] = await pool.query(
      'SELECT * FROM accounts WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newAccount[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PUT /api/accounts/:id ────────────────────────────────────────────────────
// Update an account
router.put('/:id', async (req, res) => {
  const { name, type } = req.body;
  const accountId = req.params.id;

  try {
    // Verify ownership
    const [account] = await pool.query(
      'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
      [accountId, req.user.id]
    );

    if (account.length === 0) {
      return res.status(404).json({ error: 'Account not found or unauthorized' });
    }

    await pool.query(
      'UPDATE accounts SET name = ?, type = ? WHERE id = ?',
      [name || account[0].name, type || account[0].type, accountId]
    );

    res.json({ success: true, message: 'Account updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── DELETE /api/accounts/:id ─────────────────────────────────────────────────
// Delete an account
router.delete('/:id', async (req, res) => {
  const accountId = req.params.id;

  try {
    // Verify ownership
    const [account] = await pool.query(
      'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
      [accountId, req.user.id]
    );

    if (account.length === 0) {
      return res.status(404).json({ error: 'Account not found or unauthorized' });
    }

    // Can't delete if it's the last account
    const [allAccounts] = await pool.query(
      'SELECT id FROM accounts WHERE user_id = ?',
      [req.user.id]
    );

    if (allAccounts.length === 1) {
      return res.status(400).json({ error: 'Cannot delete your only account' });
    }

    await pool.query('DELETE FROM accounts WHERE id = ?', [accountId]);

    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
