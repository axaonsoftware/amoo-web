const { Pool } = require('pg');
const p = new Pool({ host: '127.0.0.1', port: 5432, user: 'postgres', password: 'postgres', database: 'amoo_db' });
(async () => {
  await p.query("ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check");
  await p.query("ALTER TABLE payments ADD CONSTRAINT payments_status_check CHECK (status IN ('success','pending','failed','refunded','refund_pending'))");
  console.log('payments.status CHECK constraint updated to include refund_pending');
  await p.end();
})().catch(e => { console.error(e.message); process.exit(1); });
