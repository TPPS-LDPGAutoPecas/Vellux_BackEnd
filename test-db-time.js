require('dotenv').config();
const db = require('./config/db');

async function test() {
  try {
    const query = `
      SELECT 
        CURRENT_TIMESTAMP as "raw_current",
        TO_CHAR(CURRENT_TIMESTAMP, 'DD/MM/YYYY HH24:MI') as "no_tz",
        TO_CHAR(CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') as "with_tz"
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
