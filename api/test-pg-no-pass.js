const {Pool} = require('pg');
async function test(){
  const pool = new Pool({ host:'localhost', port:5432, database:'postgres', user:'postgres', password:'', connectionTimeoutMillis:2000 });
  try {
    const result = await pool.query('SELECT version();');
    console.log('SUCCESS sin contraseña:', result.rows[0].version);
    await pool.end();
    return;
  } catch (err) {
    console.log('FAIL sin contraseña:', err.message);
    await pool.end();
  }
}
test();
