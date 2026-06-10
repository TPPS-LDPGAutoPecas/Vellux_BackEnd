const request = require('supertest');
const express = require('express');
const VehicleModel = require('../models/vehicleModel');
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

jest.mock('../models/vehicleModel');

const vehicleRoutes = require('../routes/vehicleRoutes');

const app = express();
app.use(express.json());
app.use('/api/vehicles', vehicleRoutes);

describe('Testes - Veículos', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/vehicles', () => {
    test('Deve listar os veículos do usuário', async () => {
      mockUser = { id: 1, role: 'client' };
      const mockVeiculos = [
        { id: 1, ownerId: 1, make: 'Honda', model: 'Civic', year: 2020, plate: 'ABC1234', color: 'Preto' }
      ];
      VehicleModel.buscarPorDono.mockResolvedValue(mockVeiculos);

      const res = await request(app).get('/api/vehicles');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockVeiculos);
      expect(VehicleModel.buscarPorDono).toHaveBeenCalledWith(1);
    });

    test('Deve retornar 500 em caso de erro', async () => {
      VehicleModel.buscarPorDono.mockRejectedValue(new Error('Erro no BD'));

      const res = await request(app).get('/api/vehicles');

      expect(res.status).toBe(500);
      expect(res.body.erro).toBe('Erro interno ao listar veículos');
    });
  });

  describe('POST /api/vehicles', () => {
    test('Deve falhar ao tentar adicionar sem campos obrigatórios', async () => {
      const payload = { make: 'Honda' }; // faltando model, year, plate, color

      const res = await request(app).post('/api/vehicles').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.erro).toBe('Os campos marca, modelo, ano, placa e cor são obrigatórios');
      expect(VehicleModel.adicionar).not.toHaveBeenCalled();
    });

    test('Deve retornar 400 se a placa ou chassi já existirem', async () => {
      const payload = { make: 'Honda', model: 'Civic', year: 2020, plate: 'ABC1234', color: 'Preto' };
      const err = new Error('duplicate key');
      err.code = '23505';
      VehicleModel.adicionar.mockRejectedValue(err);

      const res = await request(app).post('/api/vehicles').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.erro).toBe('Placa ou Chassi já cadastrados');
    });

    test('Deve adicionar veículo com sucesso', async () => {
      const payload = { make: 'Honda', model: 'Civic', year: 2020, plate: 'ABC1234', color: 'Preto' };
      const mockVeiculo = { id: 1, ownerId: 1, ...payload };
      VehicleModel.adicionar.mockResolvedValue(mockVeiculo);

      const res = await request(app).post('/api/vehicles').send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockVeiculo);
      expect(VehicleModel.adicionar).toHaveBeenCalledWith(1, 'Honda', 'Civic', 2020, 'ABC1234', 'Preto', undefined);
    });
  });
});
