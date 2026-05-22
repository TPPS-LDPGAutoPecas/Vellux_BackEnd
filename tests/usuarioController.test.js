const request = require('supertest');
const express = require('express');
const usuarioRoutes = require('../routes/usuarioRoutes');
const usuarioModel = require('../models/usuarioModel');

jest.mock('../models/usuarioModel');

const app = express();
app.use(express.json());
app.use('/api', usuarioRoutes);

describe('Testes parametrizados - usuarioController', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    ['Sem nome', { email: 'teste@teste.com', password: '123', role: 'client' }, 400, 'display_name, email, password e role são obrigatórios.'],
    ['Sem email', { display_name: 'Teste', password: '123', role: 'client' }, 400, 'display_name, email, password e role são obrigatórios.'],
    ['Sem password', { display_name: 'Teste', email: 'teste@teste.com', role: 'client' }, 400, 'display_name, email, password e role são obrigatórios.'],
    ['Sem role', { display_name: 'Teste', email: 'teste@teste.com', password: '123' }, 400, 'display_name, email, password e role são obrigatórios.'],
    ['Role invalida', { display_name: 'Teste', email: 'teste@teste.com', password: '123', role: 'gerente' }, 400, 'Role de usuário inválida. Escolha admin, client ou mechanic.']
  ])('Deve falhar ao registrar - Caso: %s', async (descricao, payload, statusEsperado, mensagemEsperada) => {
    const res = await request(app).post('/api/usuarios').send(payload);
    
    expect(res.status).toBe(statusEsperado);
    expect(res.body.erro).toBe(mensagemEsperada);
    expect(usuarioModel.criarUsuario).not.toHaveBeenCalled();
  });

  test.each([
    ['admin', { display_name: 'Admin Teste', email: 'admin@teste.com', password: '123', role: 'admin' }],
    ['client', { display_name: 'Cliente Teste', email: 'cliente@teste.com', password: '123', role: 'client' }],
    ['mechanic', { display_name: 'Mecanico Teste', email: 'mecanico@teste.com', password: '123', role: 'mechanic' }]
  ])('Deve cadastrar usuario com sucesso - Tipo: %s', async (tipo, payload) => {
    usuarioModel.criarUsuario.mockResolvedValue({
      id: 'uuid-1234',
      ...payload
    });

    const res = await request(app).post('/api/usuarios').send(payload);
    
    expect(res.status).toBe(201);
    expect(res.body.mensagem).toBe('Usuário cadastrado com sucesso!');
    expect(res.body.usuario.role).toBe(tipo);
    expect(usuarioModel.criarUsuario).toHaveBeenCalledWith(payload.display_name, payload.email, payload.password, tipo);
  });

});
