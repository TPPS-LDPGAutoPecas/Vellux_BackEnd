const FinanceModel = require('../models/financeModel');

class FinanceController {
  static async getDashboardMetrics(req, res) {
    try {
      const { range } = req.query; // 'week', 'month', 'quarter', 'year'
      
      const metrics = await FinanceModel.getDashboardMetrics(range);
      
      return res.status(200).json(metrics);
    } catch (err) {
      console.error('Erro ao buscar métricas financeiras:', err);
      return res.status(500).json({ erro: 'Erro interno ao buscar métricas financeiras' });
    }
  }
}

module.exports = FinanceController;
