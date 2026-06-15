const FinanceModel = require('../models/financeModel');

class FinanceController {
  static async getDashboardMetrics(req, res) {
    try {
      const { range, startDate, endDate } = req.query; // 'week', 'month', 'quarter', 'year', 'custom'
      
      const metrics = await FinanceModel.getDashboardMetrics(range, startDate, endDate);
      
      return res.status(200).json(metrics);
    } catch (err) {
      console.error('Erro ao buscar métricas financeiras:', err);
      return res.status(500).json({ erro: 'Erro interno ao buscar métricas financeiras' });
    }
  }
}

module.exports = FinanceController;
