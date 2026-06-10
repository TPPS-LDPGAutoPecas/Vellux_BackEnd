const request = require('supertest');
const express = require('express');
const ServiceModel = require('../models/serviceModel');
const AuthMiddleware = require('../middlewares/authMiddleware');

let mockUser = { id: 1, role: 'client' };

jest.mock('../middlewares/authMiddleware', () => ({
  verificarAcesso: jest.fn().mockImplementation(() => {
    return (req, res, next) => {
      req.usuarioLogado = mockUser;
      next();
    };
  })
}));

jest.mock('../models/serviceModel');

const serviceRoutes = require('../routes/serviceRoutes');

const app = express();
app.use(express.json());
app.use('/api/services', serviceRoutes);

describe('Testes - Serviços', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/services', () => {
    test('Deve listar os serviços do cliente', async () => {
      mockUser = { id: 1, role: 'client' };
      const mockServicos = [
        { id: 1, title: 'Troca de Óleo', status: 'completed' }
      ];
      ServiceModel.buscarPorCliente.mockResolvedValue(mockServicos);

      const res = await request(app).get('/api/services');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockServicos);
      expect(ServiceModel.buscarPorCliente).toHaveBeenCalledWith(1);
    });

    test('Deve retornar 500 em caso de erro', async () => {
      ServiceModel.buscarPorCliente.mockRejectedValue(new Error('Erro no BD'));

      const res = await request(app).get('/api/services');

      expect(res.status).toBe(500);
      expect(res.body.erro).toBe('Erro interno ao listar serviços');
    });
  });
});
