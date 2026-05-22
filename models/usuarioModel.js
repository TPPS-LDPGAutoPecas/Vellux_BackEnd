const db = require('../config/db');

const criarUsuario = async (displayName, email, passwordHash, role) => {
  const query = `
    INSERT INTO users (display_name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, display_name, email, role, created_at;
  `;
  const values = [displayName, email, passwordHash, role];
  
  const result = await db.query(query, values);
  return result.rows[0];
};

module.exports = { criarUsuario };