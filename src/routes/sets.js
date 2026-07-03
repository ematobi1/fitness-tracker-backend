const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// POST /sets — log a completed set (from Active Workout)
router.post('/', async (req, res) => {
  try {
    const { exerciseName, setNumber, reps, weightLbs } = req.body || {};
    if (!exerciseName || !setNumber || reps == null) {
      return res.status(400).json({ message: 'exerciseName, setNumber, and reps are required.' });
    }
    const result = await pool.query(
      `INSERT INTO completed_sets (user_id, exercise_name, set_number, reps, weight_lbs)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, exercise_name AS "exerciseName", set_number AS "setNumber", reps, weight_lbs AS "weightLbs", completed_at AS "completedAt"`,
      [req.userId, exerciseName, setNumber, reps, weightLbs ?? null]
    );
    res.status(201).json({ set: result.rows[0] });
  } catch (err) {
    console.error('Log set error:', err.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET /sets/records — best logged set per exercise, ranked by weight then reps
router.get('/records', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (exercise_name)
         exercise_name AS "exerciseName", reps, weight_lbs AS "weightLbs", completed_at AS "completedAt"
       FROM completed_sets
       WHERE user_id = $1 AND weight_lbs IS NOT NULL
       ORDER BY exercise_name, weight_lbs DESC, reps DESC, completed_at DESC`,
      [req.userId]
    );
    res.json({ records: result.rows });
  } catch (err) {
    console.error('Get records error:', err.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
