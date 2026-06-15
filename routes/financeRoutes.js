const express = require('express');
const router = express.Router();
const FinanceController = require('../controllers/financeController');
const AuthMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Financeiro
 *   description: Métricas e inteligência financeira
 */

/**
 * @swagger
 * /api/finance/dashboard:
 *   get:
 *     summary: Retorna as métricas do dashboard financeiro
 *     tags: [Financeiro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *         description: Período do filtro (week, month, quarter, year)
 *     responses:
 *       200:
 *         description: Métricas financeiras
 */
router.get('/dashboard', AuthMiddleware.verificarAcesso(['admin']), FinanceController.getDashboardMetrics);

module.exports = router;
