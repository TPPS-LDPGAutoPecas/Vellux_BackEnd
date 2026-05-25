const express = require('express');
const router = express.Router();
const AgendamentoController = require('../controllers/agendamentoController');
const AuthMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Cria um novo agendamento no sistema e no Google Calendar
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicle_id
 *               - service_type
 *               - date
 *               - time
 *             properties:
 *               vehicle_id:
 *                 type: integer
 *                 example: 1
 *               service_type:
 *                 type: string
 *                 example: "Revisão & Mecânica"
 *               date:
 *                 type: string
 *                 example: "2026-05-15"
 *               time:
 *                 type: string
 *                 example: "10:00"
 *               notes:
 *                 type: string
 *                 example: "Por favor, checar barulho estranho na roda direita "
 *     responses:
 *       201:
 *         description: Agendamento confirmed com sucesso
 *       400:
 *         description: Todos os campos são obrigatórios
 *       500:
 *         description: Erro interno ao processar o agendamento
 */
router.post('/', AuthMiddleware.verificarAcesso(['client', 'admin']), AgendamentoController.agendarServico);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Cancela um agendamento no sistema e remove do Google Calendar
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do agendamento a ser cancelado
 *     responses:
 *       200:
 *         description: Agendamento cancelado com sucesso nas duas plataformas 
 *       403:
 *         description: Não tem permissão para cancelar este agendamento
 *       404:
 *         description: Agendamento não encontrado
 *       500:
 *         description: Erro interno ao processar
 */
router.delete('/:id', AuthMiddleware.verificarAcesso(['client', 'admin']), AgendamentoController.cancelarServico);

module.exports = router;