const jwt = require('jsonwebtoken');

const authMiddleware = (rolesPermitidas = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ erro: 'Token não fornecido.' });
    }

    const [, token] = authHeader.split(' ');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.usuarioLogado = decoded;

      // Se passou roles, verifica se o usuario logado tem permissao
      if (rolesPermitidas.length > 0 && !rolesPermitidas.includes(decoded.role)) {
        return res.status(403).json({ erro: 'Acesso negado. Nível de permissão insuficiente.' });
      }

      return next();
    } catch (err) {
      return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
  };
};

module.exports = authMiddleware;
