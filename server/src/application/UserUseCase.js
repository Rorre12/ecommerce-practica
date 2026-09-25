const { USER_STATUS } = require('../domain/entities/User');
const { NotFoundError, ValidationError } = require('../domain/errors');

class UserUseCase {
  /** @param {{userRepository: import('../domain/ports/UserRepository')}} deps */
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  /** @param {{status?: string}} [filter] */
  async list({ status } = {}) {
    if (status !== undefined && !Object.values(USER_STATUS).includes(status)) {
      throw new ValidationError('Estado inválido');
    }
    const users = await this.userRepository.findAll({ status });
    return users.map((u) => u.toPublic());
  }

  /**
   * El admin aprueba/rechaza una solicitud y decide qué pantallas puede ver el usuario.
   * @param {number} id
   * @param {{status?: string, permissions?: string[]}} changes
   */
  async review(id, changes) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError(`Usuario ${id} no encontrado`);
    const updated = user.review(changes);
    return (await this.userRepository.update(updated)).toPublic();
  }
}

module.exports = UserUseCase;
