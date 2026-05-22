const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas públicas
router.post('/register', usuarioController.registrarUsuario);
router.post('/login', usuarioController.login);

// Exemplo de rota protegida apenas para admins (usado para criar outros admins/mecânicos depois)
// router.post('/admin/create-user', authMiddleware(['admin']), adminController.createUser);

module.exports = router;
