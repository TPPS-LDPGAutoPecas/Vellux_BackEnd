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

module.exports = router;
