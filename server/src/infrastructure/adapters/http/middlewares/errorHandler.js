const { DomainError } = require('../../../../domain/errors');

// Traducción de errores de dominio a códigos HTTP
const STATUS_BY_CODE = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INSUFFICIENT_STOCK: 409,
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Ruta ${req.method} ${req.originalUrl} no existe` } });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  if (err instanceof DomainError) {
    return res.status(STATUS_BY_CODE[err.code] || 400).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'El cuerpo de la petición no es JSON válido' } });
  }

  console.error(err);
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
};

module.exports = { errorHandler, notFoundHandler };
