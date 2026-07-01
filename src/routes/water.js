const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

// GET /water/today
router.get('/today', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT cup_count FROM water_logs WHERE user_id = $1 AND log_date = $2',
      [req.userId, todayDate()]
    );
    res.json({ count: result.rows[0]?.cup_count ?? 0 });
  } catch (err) {
    console.error('Get water error:', err.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// PUT /water/today  { count: number }
router.put('/today', async (req, res) => {
  try {
    const { count } = req.body || {};
    if (typeof count !== 'number' || count < 0) {
      return res.status(400).json({ message: 'A non-negative count is required.' });
    }
    await pool.query(
      `INSERT INTO water_logs (user_id, log_date, cup_count)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, log_date) DO UPDATE SET cup_count = $3`,
      [req.userId, todayDate(), count]
    );
    res.json({ count });
  } catch (err) {
    console.error('Set water error:', err.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
