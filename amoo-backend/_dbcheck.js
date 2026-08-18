const { Pool } = require('pg');
const p = new Pool({ host: '127.0.0.1', port: 5432, user: 'postgres', password: 'postgres', database: 'amoo_db' });
(async () => {
  const cols = await p.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'admins' ORDER BY ordinal_position");
  console.log('Admin columns:', cols.rows.map(r => r.column_name));
  const admins = await p.query('SELECT email, token_version FROM admins LIMIT 3');
  console.log('Admin rows:', admins.rows);
  await p.end();
})().catch(e => { console.error(e.message); p.end(); });
