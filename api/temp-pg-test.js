const {Pool} = require('pg');
const pwds = ['5126','512657','1234'];
async function test(){
  for (const p of pwds) {
    const pool = new Pool({ host:'localhost', port:5432, database:'deportes_neon', user:'postgres', password:p, connectionTimeoutMillis:2000, idleTimeoutMillis:1000 });
    try {
      await pool.query('SELECT 1');
      console.log('SUCCESS', p);
      await pool.end();
      return;
    } catch (err) {
      console.log('FAIL', p, err.message);
      await pool.end();
    }
  }
  console.log('NO PASSWORD WORKED');
}
test();
