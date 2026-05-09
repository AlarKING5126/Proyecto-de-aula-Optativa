const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ host: 'localhost', port: 5432, database: 'deportes_neon', user: 'postgres', password: '1234567890', connectionTimeoutMillis: 5000 });
  try {
    const res = await pool.query('SELECT 1');
    console.log('DB_OK');
  } catch (err) {
    console.error('DB_FAIL', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
