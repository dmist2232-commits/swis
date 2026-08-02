const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://dmist2232%40gmail.com:200732503140@sisaranew-sisara-en5m2b:5432/SISARA',
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT 1', (err, res) => {
  if (err) {
    console.error('Error connecting:', err);
  } else {
    console.log('Connected!');
  }
  pool.end();
});
