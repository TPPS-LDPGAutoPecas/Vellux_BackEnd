const { Pool } = require('pg');

const pool = new Pool({
  user: 'admin',
  host: 'db',
  database: 'meubanco',
  password: 'adminpassword',
  port: 5432,
});

module.exports = pool;