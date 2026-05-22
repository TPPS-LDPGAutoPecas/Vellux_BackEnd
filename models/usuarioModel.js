const db = require('../config/db');

const criarUsuario = async (nome, email, senha, tipo_usuario) => {
  const query = `
    INSERT INTO usuario (nome, email, senha, tipo_usuario)
    VALUES ($1, $2, $3, $4)
    RETURNING id_usuario, nome, email, tipo_usuario, ativo;
  `;
  const values = [nome, email, senha, tipo_usuario];
  
  const result = await db.query(query, values);
  return result.rows[0];
};

module.exports = { criarUsuario };