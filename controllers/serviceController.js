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
}

module.exports = ServiceController;
