const usuarioModel = require('../models/usuarioModel');

const registrarUsuario = async (req, res) => {
  const { display_name, email, password, role } = req.body;

  if (!display_name || !email || !password || !role) {
    return res.status(400).json({ erro: 'display_name, email, password e role são obrigatórios.' });
  }

  const tiposPermitidos = ['admin', 'client', 'mechanic'];
  if (!tiposPermitidos.includes(role.toLowerCase())) {
    return res.status(400).json({ erro: 'Role de usuário inválida. Escolha admin, client ou mechanic.' });
  }

  try {
    const novoUsuario = await usuarioModel.criarUsuario(
      display_name, 
      email, 
      password, 
      role.toLowerCase()
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

module.exports = { registrarUsuario };