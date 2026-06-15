const request = require('supertest');
const express = require('express');
const OverviewModel = require('../models/OverviewModel');

jest.mock('../models/OverviewModel');
jest.mock('../middlewares/authMiddleware', () => {
  return {
    verificarAcesso: jest.fn(() => (req, res, next) => {
      req.user = { id: 1, role: 'admin' };
      next();
    })
  };
});

const app = express();
app.use(express.json());
const dashboardRoutes = require('../routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

describe('Overview Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/dashboard/overview - Deve retornar dados gerais do dashboard com sucesso', async () => {
    const mockOverview = {
      stats: {
        faturamentoMensal: 15000,
        servicosAtivos: 3,
        novosClientes: 5,
        taxaFidelidade: '85.0%'
      },
      activeServices: [],
      activeServicesTotal: 3,
      todaySchedule: [],
      pendingToday: 2
    };

    OverviewModel.getOverviewData.mockResolvedValue(mockOverview);

    const res = await request(app).get('/api/dashboard/overview');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockOverview);
    expect(OverviewModel.getOverviewData).toHaveBeenCalledTimes(1);
  });

  test('GET /api/dashboard/overview - Deve retornar 500 em caso de erro', async () => {
    OverviewModel.getOverviewData.mockRejectedValue(new Error('DB Error'));

    const res = await request(app).get('/api/dashboard/overview');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('erro', 'Erro interno ao carregar o painel geral.');
  });
});
