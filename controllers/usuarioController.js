const UsuarioModel = require('../models/usuarioModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const CONFIG = require('../utils/constants');

/**
 * @class UsuarioController
 * @description Controlador para gerenciar o fluxo de requisições de usuários.
 */
class UsuarioController {
  /**
   * Registra um novo usuário no sistema.
   * @param {Object} req Objeto de requisição do Express.
   * @param {Object} res Objeto de resposta do Express.
   * @returns {Promise<Object>} Resposta JSON com status da operação.
   */
  static async registrarUsuario(req, res) {
    try {
      const displayName = req.body.display_name || req.body.nome || req.body.nomeCompleto;
      const email = req.body.email;
      const password = req.body.password || req.body.senha;
      const role = CONFIG.DEFAULT_CLIENT_ROLE;

      if (!displayName || !email || !password) {
        return res.status(400).json({ erro: 'Campos obrigatórios ausentes.' });
      }

      const passwordHash = await bcrypt.hash(password, CONFIG.SALT_ROUNDS);

      const novoUsuario = await UsuarioModel.criarUsuario(
        displayName, 
        email, 
        passwordHash, 
        role
      );
      
      return res.status(201).json({ 
        mensagem: 'Usuário cadastrado com sucesso!', 
        usuario: novoUsuario 
      });
    } catch (error) {
      if (error.code === CONFIG.ERROR_CODES.UNIQUE_VIOLATION) {
        return res.status(409).json({ erro: 'Este email já está cadastrado.' });
      }
      return res.status(500).json({ erro: 'Erro interno no servidor.', detalhes: error.message });
    }
  }

  /**
   * Autentica um usuário e gera um token JWT.
   * @param {Object} req Objeto de requisição do Express.
   * @param {Object} res Objeto de resposta do Express.
   * @returns {Promise<Object>} Resposta JSON contendo o token de acesso.
   */
  static async login(req, res) {
    try {
      const email = req.body.email;
      const password = req.body.password || req.body.senha;

      if (!email || !password) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
      }

      const usuario = await UsuarioModel.buscarUsuarioPorEmail(email);

      if (!usuario) {
        return res.status(401).json({ erro: 'Credenciais inválidas.' });
      }

      const senhaValida = await bcrypt.compare(password, usuario.password_hash);

      if (!senhaValida) {
        return res.status(401).json({ erro: 'Credenciais inválidas.' });
      }

      const payload = {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: CONFIG.JWT_EXPIRES_IN });

      return res.status(200).json({
        mensagem: 'Login realizado com sucesso!',
        token,
        usuario: {
          id: usuario.id,
          display_name: usuario.display_name,
          email: usuario.email,
          role: usuario.role
        }
      });
    } catch (error) {
      return res.status(500).json({ erro: 'Erro interno no servidor.', detalhes: error.message });
    }
  }
}

module.exports = UsuarioController;