const db = require('../config/db');

/**
 * @class UsuarioModel
 * @description Classe responsável pelas operações de banco de dados da entidade Usuário.
 */
class UsuarioModel {
  /**
   * Cria um novo usuário no banco de dados.
   * @param {string} displayName Nome de exibição do usuário.
   * @param {string} email Email do usuário.
   * @param {string} passwordHash Senha criptografada.
   * @param {string} role Papel do usuário.
   * @returns {Promise<Object>} Retorna o objeto do usuário recém-criado.
   */
  static async criarUsuario(displayName, email, passwordHash, role) {
    const query = `
      INSERT INTO users (display_name, email, password_hash, role)
      VALUES ($1, $2, $3, $4::user_role)
      RETURNING id, display_name, email, role, created_at;
    `;
    const values = [displayName, email, passwordHash, role];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Busca um usuário pelo seu email.
   * @param {string} email Email para busca.
   * @returns {Promise<Object|undefined>} Retorna o usuário encontrado ou undefined.
   */
  static async buscarUsuarioPorEmail(email) {
    const query = `
      SELECT * FROM users
      WHERE email = $1;
    `;
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  /**
   * Busca todos os usuários com papel 'mechanic'.
   * @returns {Promise<Array>} Retorna um array com os mecânicos encontrados.
   */
  static async buscarMecanicos() {
    const query = `
      SELECT id, display_name, email 
      FROM users
      WHERE role = 'mechanic'
      ORDER BY display_name ASC;
    `;
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = UsuarioModel;