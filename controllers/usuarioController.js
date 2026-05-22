const usuarioModel = require('../models/usuarioModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registrarUsuario = async (req, res) => {
  // Ignoramos qualquer 'role' enviada do frontend e forçamos 'client' para segurança
  const { display_name, email, password } = req.body;
  const role = 'client';

  if (!display_name || !email || !password) {
    return res.status(400).json({ erro: 'display_name, email e password são obrigatórios.' });
  }

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const novoUsuario = await usuarioModel.criarUsuario(
      display_name, 
      email, 
      passwordHash, 
      role
    );
    
    res.status(201).json({ 
      mensagem: 'Usuário cadastrado com sucesso!', 
      usuario: novoUsuario 
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ erro: 'Este email já está cadastrado.' });
    }
    console.error(error);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  }

  try {
    const usuario = await usuarioModel.buscarUsuarioPorEmail(email);

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

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.status(200).json({
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
    console.error(error);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

module.exports = { registrarUsuario, login };