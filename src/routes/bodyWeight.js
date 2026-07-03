const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// POST /body-weight — log a new body weight entry
router.post('/', async (req, res) => {
  try {
    const { weightLbs } = req.body || {};
    if (typeof weightLbs !== 'number' || weightLbs <= 0 || weightLbs > 1000) {
      return res.status(400).json({ message: 'A valid weightLbs number is required.' });
    }
    const result = await pool.query(
      `INSERT INTO body_weight_logs (user_id, weight_lbs) VALUES ($1, $2)
       RETURNING id, weight_lbs AS "weightLbs", logged_at AS "loggedAt"`,
      [req.userId, weightLbs]
    );
    res.status(201).json({ entry: result.rows[0] });
  } catch (err) {
    console.error('Log body weight error:', err.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET /body-weight — history, most recent first (capped to last 20 entries)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, weight_lbs AS "weightLbs", logged_at AS "loggedAt"
       FROM body_weight_logs WHERE user_id = $1
       ORDER BY logged_at DESC LIMIT 20`,
      [req.userId]
    );
    res.json({ entries: result.rows });
  } catch (err) {
    console.error('Get body weight history error:', err.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
