const request = require('supertest');
const express = require('express');
const AgendamentoModel = require('../models/agendamentoModel');
const GoogleCalendarService = require('../utils/googleCalendarService');
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

jest.mock('../models/agendamentoModel');
jest.mock('../utils/googleCalendarService');

const agendamentoRoutes = require('../routes/agendamentoRoutes');

const app = express();
app.use(express.json());
app.use('/api/appointments', agendamentoRoutes);

describe('Testes parametrizados - Agendamentos', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/appointments - Criação de Agendamento', () => {
    beforeEach(() => {
      mockUser = { id: 1, role: 'client' };
    });

    test.each([
      ['Sem vehicle_id', { service_type: 'Revisão', date: '2026-05-15', time: '10:00' }, 400, 'Todos os campos obrigatórios devem ser preenchidos.'],
      ['Sem service_type', { vehicle_id: 1, date: '2026-05-15', time: '10:00' }, 400, 'Todos os campos obrigatórios devem ser preenchidos.'],
      ['Sem date', { vehicle_id: 1, service_type: 'Revisão', time: '10:00' }, 400, 'Todos os campos obrigatórios devem ser preenchidos.'],
      ['Sem time', { vehicle_id: 1, service_type: 'Revisão', date: '2026-05-15' }, 400, 'Todos os campos obrigatórios devem ser preenchidos.']
    ])('Deve falhar ao agendar serviço - Caso: %s', async (descricao, payload, statusEsperado, mensagemEsperada) => {
      const res = await request(app).post('/api/appointments').send(payload);
      
      expect(res.status).toBe(statusEsperado);
      expect(res.body.erro).toBe(mensagemEsperada);
      expect(AgendamentoModel.obterDetalhes).not.toHaveBeenCalled();
      expect(GoogleCalendarService.criarAgendamento).not.toHaveBeenCalled();
      expect(AgendamentoModel.criarAgendamento).not.toHaveBeenCalled();
    });

    test('Deve agendar serviço com sucesso', async () => {
      const payload = { vehicle_id: 1, service_type: 'Revisão', date: '2026-05-15', time: '10:00', notes: 'Teste' };
      
      AgendamentoModel.obterDetalhes.mockResolvedValue({
        display_name: 'Cliente Teste',
        make: 'Honda',
        model: 'Civic',
        plate: 'ABC1234'
      });
      
      GoogleCalendarService.criarAgendamento.mockResolvedValue('google_id_123');
      AgendamentoModel.criarAgendamento.mockResolvedValue({
        id: 1,
        ...payload,
        client_id: 1,
        google_calendar_id: 'google_id_123'
      });

      const res = await request(app).post('/api/appointments').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.mensagem).toBe('Agendamento confirmado com sucesso!');
      expect(AgendamentoModel.obterDetalhes).toHaveBeenCalledWith(1, 1);
      expect(GoogleCalendarService.criarAgendamento).toHaveBeenCalled();
      expect(AgendamentoModel.criarAgendamento).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/appointments/:id - Cancelamento de Agendamento', () => {
    test.each([
      ['Agendamento não encontrado', null, 1, 'client', 404, 'Agendamento não encontrado.'],
      ['Sem permissão (dono diferente, não admin)', { client_id: 2, google_calendar_id: 'abc' }, 1, 'client', 403, 'Não tem permissão para cancelar este agendamento.']
    ])('Deve falhar ao cancelar serviço - Caso: %s', async (descricao, mockAgendamentoRetornado, loggedUserId, loggedUserRole, statusEsperado, mensagemEsperada) => {
      mockUser = { id: loggedUserId, role: loggedUserRole };

      AgendamentoModel.buscarPorId.mockResolvedValue(mockAgendamentoRetornado);

      const res = await request(app).delete('/api/appointments/1');
      
      expect(res.status).toBe(statusEsperado);
      expect(res.body.erro).toBe(mensagemEsperada);
      expect(AgendamentoModel.buscarPorId).toHaveBeenCalledWith('1');
      expect(GoogleCalendarService.cancelarAgendamento).not.toHaveBeenCalled();
      expect(AgendamentoModel.deletarAgendamento).not.toHaveBeenCalled();
    });

    test('Deve cancelar serviço com sucesso se for o dono', async () => {
      mockUser = { id: 1, role: 'client' };

      AgendamentoModel.buscarPorId.mockResolvedValue({ id: 1, client_id: 1, google_calendar_id: 'google_id_123' });
      GoogleCalendarService.cancelarAgendamento.mockResolvedValue();
      AgendamentoModel.deletarAgendamento.mockResolvedValue();

      const res = await request(app).delete('/api/appointments/1');

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toBe('Agendamento cancelado com sucesso.');
      expect(AgendamentoModel.buscarPorId).toHaveBeenCalledWith('1');
      expect(GoogleCalendarService.cancelarAgendamento).toHaveBeenCalledWith('google_id_123');
      expect(AgendamentoModel.deletarAgendamento).toHaveBeenCalledWith('1');
    });

    test('Deve cancelar serviço com sucesso se for admin (mesmo não sendo dono)', async () => {
      mockUser = { id: 99, role: 'admin' };

      AgendamentoModel.buscarPorId.mockResolvedValue({ id: 1, client_id: 2, google_calendar_id: 'google_id_123' });
      GoogleCalendarService.cancelarAgendamento.mockResolvedValue();
      AgendamentoModel.deletarAgendamento.mockResolvedValue();

      const res = await request(app).delete('/api/appointments/1');

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toBe('Agendamento cancelado com sucesso.');
      expect(GoogleCalendarService.cancelarAgendamento).toHaveBeenCalledWith('google_id_123');
      expect(AgendamentoModel.deletarAgendamento).toHaveBeenCalledWith('1');
    });
  });

  describe('GET /api/appointments/admin/pendentes - Listar Agendamentos Recentes (Admin)', () => {
    test('Deve retornar 200 e a lista de agendamentos pendentes', async () => {
      const mockAgendamentos = [
        { id: 1, client: 'Beto', car: 'Porsche', plate: 'PR-911', date: '2026-05-15T10:00:00.000Z' }
      ];
      AgendamentoModel.listarPendentesAdmin.mockResolvedValue(mockAgendamentos);

      const res = await request(app).get('/api/appointments/admin/pendentes');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockAgendamentos);
      expect(AgendamentoModel.listarPendentesAdmin).toHaveBeenCalled();
    });

    test('Deve retornar 500 se ocorrer erro no model', async () => {
      AgendamentoModel.listarPendentesAdmin.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/api/appointments/admin/pendentes');

      expect(res.status).toBe(500);
      expect(res.body.erro).toBe('Erro interno ao listar agendamentos pendentes.');
    });
  });

});
