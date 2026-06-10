const request = require('supertest');
const express = require('express');
const TeamModel = require('../models/teamModel');
const teamRoutes = require('../routes/teamRoutes');

let mockUser = { id: 99, role: 'admin' };

jest.mock('../middlewares/authMiddleware', () => ({
  verificarAcesso: jest.fn().mockImplementation(() => {
    return (req, res, next) => {
      req.usuarioLogado = mockUser;
      next();
    };
  })
}));

jest.mock('../models/teamModel');

const app = express();
app.use(express.json());
app.use('/api/team', teamRoutes);

describe('Testes - Gestão de Equipe (Team)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/team', () => {
    test('Deve listar toda a equipe com sucesso', async () => {
      const mockEquipe = [
        { id: 1, name: 'Marcos', role: 'mechanic', specialty: 'Motores', status: 'available', activeServices: 2, completedServices: 10, rating: '4.9' }
      ];
      TeamModel.listarEquipe.mockResolvedValue(mockEquipe);

      const res = await request(app).get('/api/team');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockEquipe);
      expect(TeamModel.listarEquipe).toHaveBeenCalled();
    });

    test('Deve retornar 500 em caso de erro', async () => {
      TeamModel.listarEquipe.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/api/team');

      expect(res.status).toBe(500);
      expect(res.body.erro).toBe('Erro interno ao listar equipe');
    });
  });

  describe('POST /api/team', () => {
    test('Deve adicionar um membro com sucesso', async () => {
      const payload = { name: 'João', email: 'joao@vellux.com', password: '123', role: 'mechanic', specialty: 'Freios', phone: '99999' };
      const mockRetorno = { id: 2, name: 'João', role: 'mechanic', specialty: 'Freios', status: 'available' };
      
      TeamModel.adicionarMembro.mockResolvedValue(mockRetorno);

      const res = await request(app).post('/api/team').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.mensagem).toBe('Membro adicionado com sucesso');
      expect(res.body.membro).toEqual(mockRetorno);
      expect(TeamModel.adicionarMembro).toHaveBeenCalled();
    });

    test('Deve falhar se faltar campos obrigatórios', async () => {
      const payload = { name: 'João' };
      const res = await request(app).post('/api/team').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.erro).toBe('Nome, email e papel são obrigatórios.');
    });
  });

  describe('PUT /api/team/:id', () => {
    test('Deve atualizar um membro com sucesso', async () => {
      const payload = { name: 'João Atualizado', role: 'mechanic', specialty: 'Freios ABS', phone: '99999', status: 'busy' };
      const mockRetorno = { id: 2, name: 'João Atualizado', role: 'mechanic', specialty: 'Freios ABS', status: 'busy' };
      
      TeamModel.atualizarMembro.mockResolvedValue(mockRetorno);

      const res = await request(app).put('/api/team/2').send(payload);

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toBe('Membro atualizado com sucesso');
      expect(res.body.membro).toEqual(mockRetorno);
      expect(TeamModel.atualizarMembro).toHaveBeenCalledWith('2', 'João Atualizado', 'mechanic', 'Freios ABS', '99999', 'busy');
    });

    test('Deve retornar 404 se membro não existir ao atualizar', async () => {
      TeamModel.atualizarMembro.mockResolvedValue(null);

      const res = await request(app).put('/api/team/99').send({ name: 'T', role: 'mechanic' });

      expect(res.status).toBe(404);
      expect(res.body.erro).toBe('Membro não encontrado.');
    });
  });

  describe('DELETE /api/team/:id', () => {
    test('Deve remover um membro com sucesso', async () => {
      TeamModel.removerMembro.mockResolvedValue({ id: 2 });

      const res = await request(app).delete('/api/team/2');

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toBe('Membro removido com sucesso');
      expect(TeamModel.removerMembro).toHaveBeenCalledWith('2');
    });

    test('Deve retornar 404 se membro não existir ao deletar', async () => {
      TeamModel.removerMembro.mockResolvedValue(null);

      const res = await request(app).delete('/api/team/99');

      expect(res.status).toBe(404);
      expect(res.body.erro).toBe('Membro não encontrado.');
    });
  });
});
