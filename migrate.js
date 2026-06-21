const db = require('./config/db');

async function runMigration() {
  try {
    await db.query(`
      DO $$ 
      BEGIN
          ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'rejected';
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await db.query(`
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    `);

    console.log("Migration executed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
