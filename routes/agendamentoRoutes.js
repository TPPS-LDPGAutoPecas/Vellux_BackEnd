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
 *         description: Agendamento confirmado com sucesso
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
 *         description: Agendamento cancelado com sucesso 
 *       403:
 *         description: Não tem permissão para cancelar este agendamento
 *       404:
 *         description: Agendamento não encontrado
 *       500:
 *         description: Erro interno ao processar
 */
router.delete('/:id', AuthMiddleware.verificarAcesso(['client', 'admin']), AgendamentoController.cancelarServico);

/**
 * @swagger
 * /api/appointments/admin/pendentes:
 *   get:
 *     summary: Lista agendamentos que ainda não viraram serviços
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de agendamentos pendentes
 */
router.get('/admin/pendentes', AuthMiddleware.verificarAcesso(['admin', 'mechanic']), AgendamentoController.listarPendentesAdmin);

/**
 * @swagger
 * /api/appointments/admin/requests:
 *   get:
 *     summary: Lista agendamentos aguardando aprovação (Admin)
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de agendamentos pendentes de aprovação
 */
router.get('/admin/requests', AuthMiddleware.verificarAcesso(['admin', 'mechanic']), AgendamentoController.listarSolicitacoesAdmin);

/**
 * @swagger
 * /api/appointments/available-slots:
 *   get:
 *     summary: Lista horários disponíveis para uma data
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *         description: Data no formato YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Lista de horários disponíveis
 *       400:
 *         description: Data não informada
 */
router.get('/available-slots', AuthMiddleware.verificarAcesso(['client', 'admin']), AgendamentoController.buscarHorariosDisponiveis);

/**
 * @swagger
 * /api/appointments/{id}/approve:
 *   put:
 *     summary: Aprova uma solicitação de agendamento (Admin)
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Agendamento aprovado com sucesso
 */
router.put('/:id/approve', AuthMiddleware.verificarAcesso(['admin', 'mechanic']), AgendamentoController.aprovarServico);

/**
 * @swagger
 * /api/appointments/{id}/reject:
 *   put:
 *     summary: Rejeita uma solicitação de agendamento (Admin)
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Agendamento rejeitado com sucesso
 */
router.put('/:id/reject', AuthMiddleware.verificarAcesso(['admin', 'mechanic']), AgendamentoController.rejeitarServico);

/**
 * @swagger
 * /api/appointments/client:
 *   get:
 *     summary: Lista os agendamentos do cliente logado
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de agendamentos do cliente
 */
router.get('/client', AuthMiddleware.verificarAcesso(['client', 'admin']), AgendamentoController.listarPorCliente);

module.exports = router;