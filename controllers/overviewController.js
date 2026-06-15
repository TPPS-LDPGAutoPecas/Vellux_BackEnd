const OverviewModel = require('../models/OverviewModel');

class OverviewController {
  static async getOverview(req, res) {
    try {
      const data = await OverviewModel.getOverviewData();
      return res.status(200).json(data);
    } catch (error) {
      console.error('Erro ao buscar dados do overview:', error);
      return res.status(500).json({ erro: 'Erro interno ao carregar o painel geral.' });
    }
  }
}

module.exports = OverviewController;
