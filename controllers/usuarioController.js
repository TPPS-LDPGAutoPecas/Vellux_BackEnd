const usuarioModel = require('../models/usuarioModel');

const registrarUsuario = async (req, res) => {
  const { nome, email, senha, tipo_usuario } = req.body;

  // Validação básica
  if (!nome || !email || !senha || !tipo_usuario) {
    return res.status(400).json({ erro: 'Nome, email, senha e tipo_usuario são obrigatórios.' });
  }

  // Validação do tipo de usuário conforme o CHECK do banco de dados
  const tiposPermitidos = ['ADMIN', 'CLIENTE', 'MECANICO'];
  if (!tiposPermitidos.includes(tipo_usuario.toUpperCase())) {
    return res.status(400).json({ erro: 'Tipo de usuário inválido. Escolha ADMIN, CLIENTE ou MECANICO.' });
  }

  try {
    const novoUsuario = await usuarioModel.criarUsuario(
      nome, 
      email, 
      senha, 
      tipo_usuario.toUpperCase()
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