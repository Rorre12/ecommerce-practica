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

  /**
   * Registro público: crea un comprador (CUSTOMER activo, sin permisos de gestión)
   * y abre sesión de inmediato. El admin decide después qué pantallas extra habilita.
   */
  async register({ email, password }) {
    const user = await User.create({ email, password, role: ROLES.CUSTOMER }, this.passwordHasher);

    const existing = await this.userRepository.findByEmail(user.email);
    if (existing) throw new ConflictError('El email ya está registrado');

    return this.#session(await this.userRepository.save(user));
  }

  async login({ email, password }) {
    const user = await this.userRepository.findByEmail(User.normalizeEmail(email));
    const valid = user && (await user.verifyPassword(password, this.passwordHasher));
    if (!valid) throw new UnauthorizedError('Credenciales inválidas');
    user.assertCanAccess();
    return this.#session(user);
  }

  async me(userId) {
    return (await this.getActiveUser(userId)).toPublic();
  }

  /**
   * Carga el usuario del token desde la base de datos en cada petición,
   * así los cambios de permisos o un rechazo aplican de inmediato.
   */
  async getActiveUser(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('Usuario no encontrado');
    user.assertCanAccess();
    return user;
  }

  #session(user) {
    return { user: user.toPublic(), token: this.tokenService.sign(user) };
  }
}

module.exports = AuthUseCase;
