require('dotenv').config();
const db = require('./config/db');

async function test() {
  process.env.TZ = 'America/Sao_Paulo';
  const query = `SELECT '2026-06-25 13:00:00'::TIMESTAMP AT TIME ZONE 'UTC' as "ts_with_tz"`;
  const result = await db.query(query);
  console.log("With TZ=America/Sao_Paulo AND AT TIME ZONE 'UTC':", result.rows[0].ts_with_tz.toISOString());
  process.exit();
}
test();
