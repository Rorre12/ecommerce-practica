/**
 * Errores de dominio. No conocen HTTP: el adaptador HTTP traduce `code` a un status.
 */
class DomainError extends Error {
  constructor(message, code = 'DOMAIN_ERROR', details) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

class ValidationError extends DomainError {
  constructor(message, details) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

class NotFoundError extends DomainError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 'NOT_FOUND');
  }
}

class ConflictError extends DomainError {
  constructor(message) {
    super(message, 'CONFLICT');
  }
}

class UnauthorizedError extends DomainError {
  constructor(message = 'No autenticado') {
    super(message, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends DomainError {
  constructor(message = 'No tienes permisos para esta acción') {
    super(message, 'FORBIDDEN');
  }
}

class InsufficientStockError extends DomainError {
  constructor(message, details) {
    super(message, 'INSUFFICIENT_STOCK', details);
  }
}

module.exports = {
  DomainError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  InsufficientStockError,
};
