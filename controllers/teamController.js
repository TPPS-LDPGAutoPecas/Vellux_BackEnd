const TeamModel = require('../models/teamModel');
const bcrypt = require('bcrypt');
const CONFIG = require('../utils/constants');

class TeamController {
  static async listarEquipe(req, res) {
    try {
      const equipe = await TeamModel.listarEquipe();
      return res.status(200).json(equipe);
    } catch (error) {
      console.error('Erro ao listar equipe:', error);
      return res.status(500).json({ erro: 'Erro interno ao listar equipe' });
    }
  }

  static async adicionarMembro(req, res) {
    try {
      const { name, email, password, role, specialty, phone } = req.body;
      
      if (!name || !email || !role) {
        return res.status(400).json({ erro: 'Nome, email e papel são obrigatórios.' });
      }

      // Se a senha não for fornecida, usa vellux123
      const plainPassword = password || 'vellux123';
      const passwordHash = await bcrypt.hash(plainPassword, CONFIG.SALT_ROUNDS);

      const novoMembro = await TeamModel.adicionarMembro(name, email, passwordHash, role, specialty || '', phone || '');
      
      return res.status(201).json({ mensagem: 'Membro adicionado com sucesso', membro: novoMembro });
    } catch (error) {
      if (error.code === CONFIG.ERROR_CODES.UNIQUE_VIOLATION) {
        return res.status(409).json({ erro: 'Este email já está cadastrado.' });
      }
      console.error('Erro ao adicionar membro:', error);
      return res.status(500).json({ erro: 'Erro interno ao adicionar membro' });
    }
  }

  static async atualizarMembro(req, res) {
    try {
      const { id } = req.params;
      const { name, role, specialty, phone, status } = req.body;

      if (!name || !role) {
        return res.status(400).json({ erro: 'Nome e papel são obrigatórios.' });
      }

      const membroAtualizado = await TeamModel.atualizarMembro(id, name, role, specialty || '', phone || '', status || 'available');
      
      if (!membroAtualizado) {
         return res.status(404).json({ erro: 'Membro não encontrado.' });
      }

      return res.status(200).json({ mensagem: 'Membro atualizado com sucesso', membro: membroAtualizado });
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      return res.status(500).json({ erro: 'Erro interno ao atualizar membro' });
    }
  }

  static async removerMembro(req, res) {
    try {
      const { id } = req.params;

      const result = await TeamModel.removerMembro(id);
      
      if (!result) {
        return res.status(404).json({ erro: 'Membro não encontrado.' });
      }

      return res.status(200).json({ mensagem: 'Membro removido com sucesso' });
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      return res.status(500).json({ erro: 'Erro interno ao remover membro' });
    }
  }
}

module.exports = TeamController;
