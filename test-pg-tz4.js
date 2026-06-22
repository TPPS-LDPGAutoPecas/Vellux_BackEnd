require('dotenv').config();
const db = require('./config/db');

async function test() {
  const query = `
    SELECT 
      '2026-06-25 13:00:00'::TIMESTAMP as raw_timestamp,
      '2026-06-25 13:00:00'::TIMESTAMP AT TIME ZONE 'UTC' as with_utc_tz
  `;
  const result = await db.query(query);
  console.log("raw_timestamp:", result.rows[0].raw_timestamp.toISOString());
  console.log("with_utc_tz:", result.rows[0].with_utc_tz.toISOString());
  process.exit();
}
test();
