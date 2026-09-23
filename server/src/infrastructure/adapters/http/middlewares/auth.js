const { UnauthorizedError, ForbiddenError } = require('../../../../domain/errors');

/** Verifica el header `Authorization: Bearer <token>` y deja el usuario en req.user. */
const authenticate = (tokenService) => (req, _res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Token de autenticación requerido'));
  }
  try {
    req.user = tokenService.verify(token);
    return next();
  } catch (err) {
    return next(err);
  }
};

/** Restringe la ruta a los roles indicados. Usar después de authenticate. */
const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ForbiddenError());
  }
  return next();
};

module.exports = { authenticate, authorize };
