const { ValidationError } = require('../errors');

const ROLES = Object.freeze({ ADMIN: 'ADMIN', CUSTOMER: 'CUSTOMER' });

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
// bcrypt solo considera los primeros 72 bytes
const MAX_PASSWORD_LENGTH = 72;

class User {
  constructor({ id, email, password, role = ROLES.CUSTOMER, createdAt }) {
    this.id = id;
    this.email = email;
    this.password = password; // siempre hasheada
    this.role = role;
    this.createdAt = createdAt;
  }

  static normalizeEmail(email) {
    return typeof email === 'string' ? email.trim().toLowerCase() : '';
  }

  static validateCredentials({ email, password }) {
    const errors = [];
    if (!EMAIL_REGEX.test(User.normalizeEmail(email))) {
      errors.push('Email inválido');
    }
    if (
      typeof password !== 'string' ||
      password.length < MIN_PASSWORD_LENGTH ||
      password.length > MAX_PASSWORD_LENGTH
    ) {
      errors.push(`La contraseña debe tener entre ${MIN_PASSWORD_LENGTH} y ${MAX_PASSWORD_LENGTH} caracteres`);
    }
    if (errors.length) throw new ValidationError(errors.join('. '), errors);
  }

  /**
   * Crea un usuario nuevo con la contraseña hasheada.
   * @param {{email: string, password: string, role?: string}} data
   * @param {import('../ports/PasswordHasher')} passwordHasher
   */
  static async create({ email, password, role = ROLES.CUSTOMER }, passwordHasher) {
    User.validateCredentials({ email, password });
    if (!Object.values(ROLES).includes(role)) {
      throw new ValidationError('Rol inválido');
    }
    const hashed = await passwordHasher.hash(password);
    return new User({ email: User.normalizeEmail(email), password: hashed, role });
  }

  verifyPassword(plainPassword, passwordHasher) {
    if (typeof plainPassword !== 'string') return Promise.resolve(false);
    return passwordHasher.compare(plainPassword, this.password);
  }

  isAdmin() {
    return this.role === ROLES.ADMIN;
  }

  toPublic() {
    return { id: this.id, email: this.email, role: this.role, createdAt: this.createdAt };
  }
}

module.exports = { User, ROLES };
