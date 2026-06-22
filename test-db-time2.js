require('dotenv').config();
const db = require('./config/db');

async function test() {
  try {
    const query = `
      SELECT 
        (CURRENT_TIMESTAMP::TIMESTAMP) as "raw_timestamp",
        TO_CHAR(CURRENT_TIMESTAMP::TIMESTAMP, 'DD/MM/YYYY HH24:MI') as "no_tz",
        TO_CHAR((CURRENT_TIMESTAMP::TIMESTAMP) AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') as "with_tz",
        TO_CHAR((CURRENT_TIMESTAMP::TIMESTAMP) AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') as "fixed_tz"
    `;
    const result = await db.query(query);
    console.log(result.rows[0]);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
test();
