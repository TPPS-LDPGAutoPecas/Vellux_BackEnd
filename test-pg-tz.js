require('dotenv').config();
const db = require('./config/db');

async function test() {
  process.env.TZ = 'America/Sao_Paulo';
  const query = `SELECT '2026-06-25 13:00:00'::TIMESTAMP as "ts_without_tz"`;
  const result = await db.query(query);
  console.log("With TZ=America/Sao_Paulo:", result.rows[0].ts_without_tz.toISOString());
  process.exit();
}
test();
