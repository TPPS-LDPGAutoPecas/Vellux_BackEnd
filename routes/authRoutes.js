const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarioController');
const AuthMiddleware = require('../middlewares/authMiddleware');

router.post('/register', UsuarioController.registrarUsuario);
router.post('/login', UsuarioController.login);

module.exports = router;