const { User, ROLES } = require('../domain/entities/User');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../domain/errors');

class AuthUseCase {
  /**
   * @param {{
   *   userRepository: import('../domain/ports/UserRepository'),
   *   passwordHasher: import('../domain/ports/PasswordHasher'),
   *   tokenService: import('../domain/ports/TokenService'),
   * }} deps
   */
  constructor({ userRepository, passwordHasher, tokenService }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  /** Registro público: siempre crea clientes (CUSTOMER). */
  async register({ email, password }) {
    const user = await User.create({ email, password, role: ROLES.CUSTOMER }, this.passwordHasher);

    const existing = await this.userRepository.findByEmail(user.email);
    if (existing) throw new ConflictError('El email ya está registrado');

    const saved = await this.userRepository.save(user);
    return this.#session(saved);
  }

  async login({ email, password }) {
    const user = await this.userRepository.findByEmail(User.normalizeEmail(email));
    const valid = user && (await user.verifyPassword(password, this.passwordHasher));
    if (!valid) throw new UnauthorizedError('Credenciales inválidas');
    return this.#session(user);
  }

  async me(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('Usuario no encontrado');
    return user.toPublic();
  }

  #session(user) {
    return { user: user.toPublic(), token: this.tokenService.sign(user) };
  }
}

module.exports = AuthUseCase;
