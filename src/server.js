require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const workoutsRoutes = require('./routes/workouts');
const waterRoutes = require('./routes/water');
const setsRoutes = require('./routes/sets');
const bodyWeightRoutes = require('./routes/bodyWeight');

const app = express();

// Fail fast and loud if secrets are missing — better than a silent insecure default.
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set.');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

app.use(helmet());
app.use(cors()); // mobile app has no browser origin to restrict; fine to leave open
app.use(express.json({ limit: '100kb' }));

// Brute-force protection on auth endpoints specifically.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many attempts. Try again in a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/register', authLimiter);
app.use('/login', authLimiter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/', authRoutes); // exposes /register, /login, /me
app.use('/workouts', workoutsRoutes);
app.use('/water', waterRoutes);
app.use('/sets', setsRoutes);
app.use('/body-weight', bodyWeightRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Fitness tracker API listening on port ${PORT}`);
});
