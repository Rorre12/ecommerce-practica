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

  /**
   * @param {{status?: string}} [filter]
   * @returns {Promise<import('../entities/User').User[]>}
   */
  async findAll(_filter) {
    throw new Error('UserRepository.findAll no implementado');
  }

  /** @returns {Promise<import('../entities/User').User>} */
  async save(_user) {
    throw new Error('UserRepository.save no implementado');
  }

  /** Persiste estado y permisos de un usuario existente. */
  async update(_user) {
    throw new Error('UserRepository.update no implementado');
  }
}

module.exports = UserRepository;
