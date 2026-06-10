const express = require('express');
const router = express.Router();
const TeamController = require('../controllers/teamController');
const AuthMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/team:
 *   get:
 *     summary: Lista toda a equipe de especialistas
 *     tags: [Equipe]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', AuthMiddleware.verificarAcesso(['admin']), TeamController.listarEquipe);

/**
 * @swagger
 * /api/team:
 *   post:
 *     summary: Adiciona um novo membro a equipe
 *     tags: [Equipe]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', AuthMiddleware.verificarAcesso(['admin']), TeamController.adicionarMembro);

/**
 * @swagger
 * /api/team/{id}:
 *   put:
 *     summary: Atualiza os dados de um membro da equipe
 *     tags: [Equipe]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', AuthMiddleware.verificarAcesso(['admin']), TeamController.atualizarMembro);

/**
 * @swagger
 * /api/team/{id}:
 *   delete:
 *     summary: Remove um membro da equipe
 *     tags: [Equipe]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', AuthMiddleware.verificarAcesso(['admin']), TeamController.removerMembro);

module.exports = router;
