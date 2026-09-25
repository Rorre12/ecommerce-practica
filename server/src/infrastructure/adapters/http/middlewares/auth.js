const { UnauthorizedError, ForbiddenError } = require('../../../../domain/errors');

/**
 * Verifica el header `Authorization: Bearer <token>` y deja en req.user el usuario
 * vigente (entidad de dominio), recargado desde la BD para respetar cambios de permisos.
 * @param {import('../../../../domain/ports/TokenService')} tokenService
 * @param {import('../../../../application/AuthUseCase')} authUseCase
 */
const authenticate = (tokenService, authUseCase) => async (req, _res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Token de autenticación requerido'));
  }
  try {
    const { id } = tokenService.verify(token);
    req.user = await authUseCase.getActiveUser(id);
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

/** Restringe la ruta a quien tenga el permiso (el admin los tiene todos). Usar después de authenticate. */
const requirePermission = (permission) => (req, _res, next) => {
  if (!req.user || !req.user.can(permission)) {
    return next(new ForbiddenError());
  }
  return next();
};

module.exports = { authenticate, authorize, requirePermission };
