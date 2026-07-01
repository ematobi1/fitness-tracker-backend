const { Pool } = require('pg');

// Render/Railway both provide DATABASE_URL automatically once a Postgres
// instance is attached. SSL is required on their managed Postgres in production.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

module.exports = pool;
