const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/serviceController');
const AuthMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Lista as ordens de serviço do cliente logado
 *     tags: [Serviços]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de serviços retornada com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get('/', AuthMiddleware.verificarAcesso(['client', 'admin']), ServiceController.listarMeusServicos);

/**
 * @swagger
 * /api/services/admin:
 *   get:
 *     summary: Lista todos os serviços para o painel admin
 *     tags: [Serviços]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de serviços detalhada
 */
router.get('/admin', AuthMiddleware.verificarAcesso(['admin', 'mechanic']), ServiceController.listarParaAdmin);

/**
 * @swagger
 * /api/services/checkin:
 *   post:
 *     summary: Faz o check-in de um agendamento criando um serviço
 *     tags: [Serviços]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Check-in realizado
 */
router.post('/checkin', AuthMiddleware.verificarAcesso(['admin', 'mechanic']), ServiceController.fazerCheckin);

/**
 * @swagger
 * /api/services/{id}/start:
 *   post:
 *     summary: Inicia a execução técnica de um serviço
 *     tags: [Serviços]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Serviço iniciado
 */
router.post('/:id/start', AuthMiddleware.verificarAcesso(['admin', 'mechanic']), ServiceController.iniciarServico);

/**
 * @swagger
 * /api/services/{id}/assign:
 *   post:
 *     summary: Atribui ou remove um mecânico do serviço
 *     tags: [Serviços]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sucesso na atribuição
 */
router.post('/:id/assign', AuthMiddleware.verificarAcesso(['admin']), ServiceController.atribuirMecanico);

module.exports = router;
