const { ValidationError } = require('../../../domain/errors');

module.exports = function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new ValidationError('El id debe ser un entero positivo');
  return id;
};
