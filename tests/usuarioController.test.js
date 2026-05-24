const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/authRoutes');
const usuarioModel = require('../models/usuarioModel');
const bcrypt = require('bcrypt');

jest.mock('../models/usuarioModel');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Testes parametrizados - Autenticação', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
  });

  test.each([
    ['Sem nome', { email: 'teste@teste.com', password: '123' }, 400, 'Campos obrigatórios ausentes.'],
    ['Sem email', { display_name: 'Teste', password: '123' }, 400, 'Campos obrigatórios ausentes.'],
    ['Sem password', { display_name: 'Teste', email: 'teste@teste.com' }, 400, 'Campos obrigatórios ausentes.']
  ])('Deve falhar ao registrar (Cadastro Cliente Público) - Caso: %s', async (descricao, payload, statusEsperado, mensagemEsperada) => {
    const res = await request(app).post('/api/auth/register').send(payload);
    
    expect(res.status).toBe(statusEsperado);
    expect(res.body.erro).toBe(mensagemEsperada);
    expect(usuarioModel.criarUsuario).not.toHaveBeenCalled();
  });

  test('Deve cadastrar cliente com sucesso forçando role "client"', async () => {
    const payload = { display_name: 'Cliente Teste', email: 'cliente@teste.com', password: '123', role: 'admin' }; // enviando admin maliciosamente
    
    usuarioModel.criarUsuario.mockResolvedValue({
      id: 'uuid-1234',
      display_name: payload.display_name,
      email: payload.email,
      role: 'client'
    });

    const res = await request(app).post('/api/auth/register').send(payload);
    
    expect(res.status).toBe(201);
    expect(res.body.mensagem).toBe('Usuário cadastrado com sucesso!');
    expect(res.body.usuario.role).toBe('client'); // garante que a role maliciosa foi ignorada
    expect(usuarioModel.criarUsuario).toHaveBeenCalledWith(payload.display_name, payload.email, expect.any(String), 'client');
  });

});