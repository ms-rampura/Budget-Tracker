const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');

router.use(auth);

// ─── GET /api/audit ────────────────────────────────────────────────────────
// Fetch the last 50 audit logs for the authenticated user
router.get('/', async (req, res) => {
  try {
    const [logs] = await pool.query(
      `SELECT * FROM audit_logs 
       WHERE user_id = ? 
       ORDER BY timestamp DESC 
       LIMIT 50`,
      [req.user.id]
    );
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
