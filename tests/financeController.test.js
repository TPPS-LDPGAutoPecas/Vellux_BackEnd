const request = require('supertest');
const express = require('express');
const FinanceController = require('../controllers/financeController');
const FinanceModel = require('../models/financeModel');

// Mock middlewares
jest.mock('../middlewares/authMiddleware', () => ({
  verificarAcesso: (roles) => (req, res, next) => {
    req.usuarioLogado = { id: 1, role: 'admin' };
    next();
  }
}));

jest.mock('../models/financeModel');

const app = express();
app.use(express.json());
const financeRoutes = require('../routes/financeRoutes');
app.use('/api/finance', financeRoutes);

describe('Finance Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/finance/dashboard - Deve retornar métricas de dashboard financeiro', async () => {
    const mockMetrics = {
      kpis: { totalRevenue: 10000, totalServices: 10, averageTicket: 1000 },
      revenueData: [{ name: '01/01', value: 10000 }],
      serviceMixData: [{ name: 'Troca de Óleo', count: 5, value: 5000 }],
      techPerformanceData: [{ name: 'Mecânico 1', services: 5, revenue: 5000 }],
      recentTransactions: []
    };

    FinanceModel.getDashboardMetrics.mockResolvedValue(mockMetrics);

    const res = await request(app).get('/api/finance/dashboard?range=month');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockMetrics);
    expect(FinanceModel.getDashboardMetrics).toHaveBeenCalledWith('month');
  });

  test('GET /api/finance/dashboard - Deve retornar 500 em caso de erro', async () => {
    FinanceModel.getDashboardMetrics.mockRejectedValue(new Error('DB Error'));

    const res = await request(app).get('/api/finance/dashboard');

    expect(res.status).toBe(500);
    expect(res.body.erro).toBe('Erro interno ao buscar métricas financeiras');
  });
});
