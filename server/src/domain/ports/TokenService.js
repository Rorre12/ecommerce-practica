/**
 * Puerto de salida: emisión y verificación de tokens de sesión.
 */
class TokenService {
  /** @returns {string} */
  sign(_user) {
    throw new Error('TokenService.sign no implementado');
  }

  /** @returns {{id: number, email: string, role: string}} */
  verify(_token) {
    throw new Error('TokenService.verify no implementado');
  }
}

module.exports = TokenService;
