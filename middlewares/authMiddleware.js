const jwt = require('jsonwebtoken');

/**
 * @class AuthMiddleware
 * @description Middleware para validação de tokens JWT e controle de acesso.
 */
class AuthMiddleware {
  /**
   * Retorna o middleware configurado para validar papéis específicos (O(1) com Set).
   * @param {Array<string>} rolesPermitidas Lista de papéis autorizados.
   * @returns {Function} Função de middleware do Express.
   */
  static verificarAcesso(rolesPermitidas = []) {
    const permissoesSet = new Set(rolesPermitidas);

    return (req, res, next) => {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({ erro: 'Token não fornecido.' });
      }

      const [, token] = authHeader.split(' ');

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuarioLogado = decoded;

        if (permissoesSet.size > 0 && !permissoesSet.has(decoded.role)) {
          return res.status(403).json({ erro: 'Acesso negado. Nível de permissão insuficiente.' });
        }

        return next();
      } catch (err) {
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
      }
    };
  }
}

module.exports = AuthMiddleware;