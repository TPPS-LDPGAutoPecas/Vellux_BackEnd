const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarioController');
const AuthMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Rotas de registro e login de usuários
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra um novo cliente no sistema
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - display_name
 *               - email
 *               - password
 *             properties:
 *               display_name:
 *                 type: string
 *                 example: Marcela Souza
 *               email:
 *                 type: string
 *                 example: cliente@email.com
 *               password:
 *                 type: string
 *                 example: senhaForte123
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *       400:
 *         description: Campos obrigatórios ausentes
 *       409:
 *         description: Este email já está cadastrado
 *       500:
 *         description: Erro interno no servidor
 */
router.post('/register', UsuarioController.registrarUsuario);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autentica um usuário e devolve um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@vellux.com
 *               password:
 *                 type: string
 *                 example: a_senha_que_voce_criou_no_front
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       400:
 *         description: Email e senha são obrigatórios
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro interno no servidor
 */
router.post('/login', UsuarioController.login);

/**
 * @swagger
 * /api/auth/mechanics:
 *   get:
 *     summary: Lista todos os mecânicos
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mecânicos retornada com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get('/mechanics', AuthMiddleware.verificarAcesso(['admin', 'mechanic']), UsuarioController.listarMecanicos);

module.exports = router;