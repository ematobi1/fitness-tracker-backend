const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /workouts — list this user's saved workouts
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, exercises, rest_seconds AS "restSeconds", created_at AS "savedAt" FROM workouts WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json({ workouts: result.rows });
  } catch (err) {
    console.error('List workouts error:', err.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST /workouts — save a new workout
router.post('/', async (req, res) => {
  try {
    const { name, exercises, restSeconds } = req.body || {};
    if (!name || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ message: 'A workout name and at least one exercise are required.' });
    }
    const result = await pool.query(
      'INSERT INTO workouts (user_id, name, exercises, rest_seconds) VALUES ($1, $2, $3, $4) RETURNING id, name, exercises, rest_seconds AS "restSeconds", created_at AS "savedAt"',
      [req.userId, name, JSON.stringify(exercises), restSeconds || 60]
    );
    res.status(201).json({ workout: result.rows[0] });
  } catch (err) {
    console.error('Create workout error:', err.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// DELETE /workouts/:id — remove a saved workout (only if it belongs to this user)
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM workouts WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Workout not found.' });
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error('Delete workout error:', err.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
