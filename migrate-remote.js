const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Replace @ in password with %40 to prevent URL parsing errors
const connectionString = 'postgresql://postgres.umvzffihfkvtbkeehyrw:B%40rrock2001vellux@aws-1-us-west-2.pooler.supabase.com:5432/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase Pooler DB');
    const sql = fs.readFileSync(path.join(__dirname, '01-create-tables.sql'), 'utf8');
    await client.query(sql);
    console.log('Tables created successfully!');
  } catch (err) {
    console.error('Error running SQL:', err);
  } finally {
    await client.end();
  }
}

run();
