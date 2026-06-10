const express = require('express');
const router = express.Router();
const VehicleController = require('../controllers/vehicleController');
const AuthMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Lista os veículos do usuário logado
 *     tags: [Veículos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de veículos retornada com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get('/', AuthMiddleware.verificarAcesso(['client', 'admin', 'mechanic']), VehicleController.listarMeusVeiculos);

/**
 * @swagger
 * /api/vehicles:
 *   post:
 *     summary: Adiciona um novo veículo para o usuário logado
 *     tags: [Veículos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - make
 *               - model
 *               - year
 *               - plate
 *               - color
 *             properties:
 *               make:
 *                 type: string
 *                 example: "Honda"
 *               model:
 *                 type: string
 *                 example: "Civic"
 *               year:
 *                 type: integer
 *                 example: 2024
 *               plate:
 *                 type: string
 *                 example: "BRA1234"
 *               color:
 *                 type: string
 *                 example: "Preto"
 *               vin:
 *                 type: string
 *                 example: "9BW..."
 *     responses:
 *       201:
 *         description: Veículo cadastrado com sucesso
 *       400:
 *         description: Dados incompletos ou veículo já cadastrado
 */
router.post('/', AuthMiddleware.verificarAcesso(['client', 'admin']), VehicleController.adicionarVeiculo);

module.exports = router;
