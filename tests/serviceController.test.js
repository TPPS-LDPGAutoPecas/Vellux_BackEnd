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

  describe('Admin Operations', () => {
    beforeEach(() => {
      mockUser = { id: 99, role: 'admin' };
    });

    test('GET /api/services/admin - Deve listar serviços para admin', async () => {
      const mockServicos = [{ id: 1, title: 'Revisão', status: 'pending' }];
      ServiceModel.listarParaAdmin.mockResolvedValue(mockServicos);

      const res = await request(app).get('/api/services/admin');
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockServicos);
      expect(ServiceModel.listarParaAdmin).toHaveBeenCalled();
    });

    test('POST /api/services/checkin - Deve fazer checkin com sucesso', async () => {
      const payload = { appointmentId: 1, title: 'Revisão', description: 'Teste' };
      ServiceModel.fazerCheckin.mockResolvedValue({ id: 10, ...payload, status: 'pending' });

      const res = await request(app).post('/api/services/checkin').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.mensagem).toBe('Check-in realizado com sucesso!');
      expect(ServiceModel.fazerCheckin).toHaveBeenCalledWith(1, 'Revisão', 'Teste');
    });

    test('POST /api/services/checkin - Deve falhar se faltar title', async () => {
      const res = await request(app).post('/api/services/checkin').send({ appointmentId: 1 });
      expect(res.status).toBe(400);
      expect(res.body.erro).toBe('appointmentId e title são obrigatórios.');
    });

    test('POST /api/services/:id/start - Deve iniciar serviço', async () => {
      ServiceModel.iniciarServico.mockResolvedValue({ id: 1, status: 'in_progress' });

      const res = await request(app).post('/api/services/1/start');

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toBe('Serviço iniciado com sucesso!');
      expect(ServiceModel.iniciarServico).toHaveBeenCalledWith('1', 99, undefined);
    });

    test('POST /api/services/:id/assign - Deve atribuir mecanico', async () => {
      ServiceModel.atribuirMecanico.mockResolvedValue({ action: 'added' });

      const res = await request(app).post('/api/services/1/assign').send({ mechanicId: 2 });

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toBe('Mecânico adicionado com sucesso.');
      expect(ServiceModel.atribuirMecanico).toHaveBeenCalledWith('1', 2);
    });

    test('POST /api/services/:id/finish - Deve finalizar servico com laudo', async () => {
      const payload = { serviceName: 'Revisão', finalValue: '500.00' };
      ServiceModel.finalizarServico.mockResolvedValue({ sucesso: true });

      const res = await request(app).post('/api/services/1/finish').send(payload);

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toBe('Serviço finalizado e laudo técnico emitido com sucesso.');
      expect(ServiceModel.finalizarServico).toHaveBeenCalledWith('1', 99, payload);
    });

    test('POST /api/services/:id/finish - Deve falhar sem campos obrigatorios', async () => {
      const res = await request(app).post('/api/services/1/finish').send({ serviceName: 'Revisão' });

      expect(res.status).toBe(400);
      expect(res.body.erro).toBe('Nome do serviço e valor final são obrigatórios para o laudo.');
    });

    test('POST /api/services/:id/evaluate - Deve avaliar o servico', async () => {
      mockUser = { id: 1, role: 'client' }; // override role for this test
      const payload = { rating: 5, comment: 'Bom' };
      ServiceModel.avaliarServico.mockResolvedValue(true);

      const res = await request(app).post('/api/services/1/evaluate').send(payload);

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toBe('Avaliação enviada com sucesso!');
      expect(ServiceModel.avaliarServico).toHaveBeenCalledWith('1', 1, 5, 'Bom');
    });

    test('POST /api/services/:id/evaluate - Deve falhar sem nota', async () => {
      mockUser = { id: 1, role: 'client' }; 
      const res = await request(app).post('/api/services/1/evaluate').send({ comment: 'Bom' });

      expect(res.status).toBe(400);
      expect(res.body.erro).toBe('Nota de avaliação é obrigatória.');
    });
  });
});
