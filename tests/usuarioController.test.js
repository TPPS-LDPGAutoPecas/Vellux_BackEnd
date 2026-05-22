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
    ['Sem nome', { email: 'teste@teste.com', senha: '123', tipo_usuario: 'CLIENTE' }, 400, 'Nome, email, senha e tipo_usuario são obrigatórios.'],
    ['Sem email', { nome: 'Teste', senha: '123', tipo_usuario: 'CLIENTE' }, 400, 'Nome, email, senha e tipo_usuario são obrigatórios.'],
    ['Sem senha', { nome: 'Teste', email: 'teste@teste.com', tipo_usuario: 'CLIENTE' }, 400, 'Nome, email, senha e tipo_usuario são obrigatórios.'],
    ['Sem tipo', { nome: 'Teste', email: 'teste@teste.com', senha: '123' }, 400, 'Nome, email, senha e tipo_usuario são obrigatórios.'],
    ['Tipo invalido', { nome: 'Teste', email: 'teste@teste.com', senha: '123', tipo_usuario: 'GERENTE' }, 400, 'Tipo de usuário inválido. Escolha ADMIN, CLIENTE ou MECANICO.']
  ])('Deve falhar ao registrar - Caso: %s', async (descricao, payload, statusEsperado, mensagemEsperada) => {
    const res = await request(app).post('/api/usuarios').send(payload);
    
    expect(res.status).toBe(statusEsperado);
    expect(res.body.erro).toBe(mensagemEsperada);
    expect(usuarioModel.criarUsuario).not.toHaveBeenCalled();
  });

  test.each([
    ['ADMIN', { nome: 'Admin Teste', email: 'admin@teste.com', senha: '123', tipo_usuario: 'ADMIN' }],
    ['CLIENTE', { nome: 'Cliente Teste', email: 'cliente@teste.com', senha: '123', tipo_usuario: 'CLIENTE' }],
    ['MECANICO', { nome: 'Mecanico Teste', email: 'mecanico@teste.com', senha: '123', tipo_usuario: 'MECANICO' }]
  ])('Deve cadastrar usuario com sucesso - Tipo: %s', async (tipo, payload) => {
    usuarioModel.criarUsuario.mockResolvedValue({
      id: 1,
      ...payload
    });

    const res = await request(app).post('/api/usuarios').send(payload);
    
    expect(res.status).toBe(201);
    expect(res.body.mensagem).toBe('Usuário cadastrado com sucesso!');
    expect(res.body.usuario.tipo_usuario).toBe(tipo);
    expect(usuarioModel.criarUsuario).toHaveBeenCalledWith(payload.nome, payload.email, payload.senha, tipo);
  });

});
