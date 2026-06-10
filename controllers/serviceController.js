const ServiceModel = require('../models/serviceModel');

class ServiceController {
  static async listarMeusServicos(req, res) {
    try {
      const { id: clientId } = req.usuarioLogado;
      const servicos = await ServiceModel.buscarPorCliente(clientId);
      
      return res.status(200).json(servicos);
    } catch (err) {
      console.error('Erro ao listar serviços:', err);
      return res.status(500).json({ erro: 'Erro interno ao listar serviços' });
    }
  }

  static async listarParaAdmin(req, res) {
    try {
      const servicos = await ServiceModel.listarParaAdmin();
      return res.status(200).json(servicos);
    } catch (err) {
      console.error('Erro ao listar serviços para admin:', err);
      return res.status(500).json({ erro: 'Erro interno ao listar serviços para admin' });
    }
  }

  static async fazerCheckin(req, res) {
    try {
      const { appointmentId, title, description } = req.body;
      if (!appointmentId || !title) {
        return res.status(400).json({ erro: 'appointmentId e title são obrigatórios.' });
      }
      const servico = await ServiceModel.fazerCheckin(appointmentId, title, description);
      return res.status(201).json({ mensagem: 'Check-in realizado com sucesso!', servico });
    } catch (err) {
      console.error('Erro ao fazer checkin:', err);
      return res.status(500).json({ erro: 'Erro interno ao realizar checkin' });
    }
  }

  static async iniciarServico(req, res) {
    try {
      const { id } = req.params;
      const mechanicId = req.usuarioLogado.id;
      const servicoAtualizado = await ServiceModel.iniciarServico(id, mechanicId);
      return res.status(200).json({ mensagem: 'Serviço iniciado com sucesso!', servico: servicoAtualizado });
    } catch (err) {
      console.error('Erro ao iniciar serviço:', err);
      return res.status(500).json({ erro: 'Erro interno ao iniciar serviço' });
    }
  }

  static async atribuirMecanico(req, res) {
    try {
      const { id } = req.params;
      const { mechanicId } = req.body;
      if (!mechanicId) {
         return res.status(400).json({ erro: 'mechanicId é obrigatório.' });
      }
      const resultado = await ServiceModel.atribuirMecanico(id, mechanicId);
      return res.status(200).json({ mensagem: `Mecânico ${resultado.action === 'added' ? 'adicionado' : 'removido'} com sucesso.` });
    } catch (err) {
      console.error('Erro ao atribuir mecânico:', err);
      return res.status(500).json({ erro: 'Erro interno ao atribuir mecânico' });
    }
  }
}

module.exports = ServiceController;
