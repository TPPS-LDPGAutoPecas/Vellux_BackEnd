const express = require('express');
const router = express.Router();
const overviewController = require('../controllers/overviewController');
const AuthMiddleware = require('../middlewares/authMiddleware');

router.get('/overview', AuthMiddleware.verificarAcesso(['admin']), overviewController.getOverview);

module.exports = router;
