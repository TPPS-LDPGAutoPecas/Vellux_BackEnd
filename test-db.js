require('dotenv').config();
const db = require('./config/db');

async function test() {
  try {
    const query = `
      SELECT scheduled_date 
      FROM appointments 
      WHERE DATE(scheduled_date) = $1 
      AND status NOT IN ('cancelled', 'rejected');
    `;
    const result = await db.query(query, ['2026-06-25']);
    console.log("ROWS:", result.rows);
  } catch (err) {
    console.error("DB ERROR:", err);
  } finally {
    process.exit();
  }
}
test();
