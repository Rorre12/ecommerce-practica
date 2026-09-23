/**
 * Puerto de salida: hasheo de contraseñas.
 */
class PasswordHasher {
  /** @returns {Promise<string>} */
  async hash(_plain) {
    throw new Error('PasswordHasher.hash no implementado');
  }

  /** @returns {Promise<boolean>} */
  async compare(_plain, _hash) {
    throw new Error('PasswordHasher.compare no implementado');
  }
}

module.exports = PasswordHasher;
