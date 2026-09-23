/**
 * Puerto de salida: persistencia de usuarios.
 * Los adaptadores (p. ej. Prisma) deben extender esta clase.
 */
class UserRepository {
  /** @returns {Promise<import('../entities/User').User|null>} */
  async findByEmail(_email) {
    throw new Error('UserRepository.findByEmail no implementado');
  }

  /** @returns {Promise<import('../entities/User').User|null>} */
  async findById(_id) {
    throw new Error('UserRepository.findById no implementado');
  }

  /** @returns {Promise<import('../entities/User').User>} */
  async save(_user) {
    throw new Error('UserRepository.save no implementado');
  }
}

module.exports = UserRepository;
