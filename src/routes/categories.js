const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// ─── GET /api/categories ──────────────────────────────────────────────────────
// Fetch all categories for the authenticated user
router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY type, name',
      [req.user.id]
    );
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/categories ─────────────────────────────────────────────────────
// Add a custom category
router.post('/', async (req, res) => {
  const { name, type } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)',
      [req.user.id, name, type]
    );

    const [newCategory] = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newCategory[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── DELETE /api/categories/:id ───────────────────────────────────────────────
// Delete a custom category
router.delete('/:id', async (req, res) => {
  try {
    const [category] = await pool.query(
      'SELECT * FROM categories WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (category.length === 0) {
      return res.status(404).json({ error: 'Category not found or unauthorized' });
    }

    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
