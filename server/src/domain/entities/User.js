const { ValidationError, ForbiddenError } = require('../errors');

const ROLES = Object.freeze({ ADMIN: 'ADMIN', CUSTOMER: 'CUSTOMER' });

/**
 * Estado de acceso de la cuenta. Solo APPROVED puede iniciar sesión.
 * Las cuentas nacen APPROVED; el admin puede pasarlas a REJECTED (revocar) y volver a activarlas.
 * PENDING se conserva para cuentas creadas con el flujo anterior de aprobación previa.
 */
const USER_STATUS = Object.freeze({ PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED' });

/**
 * Pantallas de gestión que el admin puede habilitar a un cliente.
 * Sin permisos (nivel más bajo: comprador), el cliente solo puede comprar en la tienda.
 */
const PERMISSIONS = Object.freeze({ PRODUCTS: 'PRODUCTS', ORDERS: 'ORDERS' });

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
// bcrypt solo considera los primeros 72 bytes
const MAX_PASSWORD_LENGTH = 72;

class User {
  constructor({ id, email, password, role = ROLES.CUSTOMER, status = USER_STATUS.APPROVED, permissions = [], createdAt }) {
    this.id = id;
    this.email = email;
    this.password = password; // siempre hasheada
    this.role = role;
    this.status = status;
    this.permissions = permissions;
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

  /** Valida y normaliza una lista de permisos (sin duplicados). */
  static normalizePermissions(permissions) {
    if (!Array.isArray(permissions)) throw new ValidationError('Los permisos deben ser una lista');
    const valid = Object.values(PERMISSIONS);
    const invalid = permissions.filter((p) => !valid.includes(p));
    if (invalid.length) throw new ValidationError(`Permisos inválidos: ${invalid.join(', ')}`);
    return [...new Set(permissions)];
  }

  /**
   * Crea un usuario nuevo con la contraseña hasheada.
   * Nace activo y sin permisos de gestión: el nivel más bajo, comprador.
   * @param {{email: string, password: string, role?: string}} data
   * @param {import('../ports/PasswordHasher')} passwordHasher
   */
  static async create({ email, password, role = ROLES.CUSTOMER }, passwordHasher) {
    User.validateCredentials({ email, password });
    if (!Object.values(ROLES).includes(role)) {
      throw new ValidationError('Rol inválido');
    }
    const hashed = await passwordHasher.hash(password);
    return new User({ email: User.normalizeEmail(email), password: hashed, role, status: USER_STATUS.APPROVED });
  }

  verifyPassword(plainPassword, passwordHasher) {
    if (typeof plainPassword !== 'string') return Promise.resolve(false);
    return passwordHasher.compare(plainPassword, this.password);
  }

  isAdmin() {
    return this.role === ROLES.ADMIN;
  }

  isApproved() {
    return this.status === USER_STATUS.APPROVED;
  }

  /** El admin tiene todos los permisos de forma implícita. */
  can(permission) {
    return this.isAdmin() || this.permissions.includes(permission);
  }

  /** Regla de negocio: solo los usuarios aprobados pueden usar el sistema. */
  assertCanAccess() {
    if (this.status === USER_STATUS.PENDING) {
      throw new ForbiddenError('Tu solicitud de registro está pendiente de aprobación por el administrador');
    }
    if (this.status === USER_STATUS.REJECTED) {
      throw new ForbiddenError('Tu acceso fue revocado por el administrador. Contacta a la tienda');
    }
  }

  /**
   * Devuelve un nuevo User con la decisión del admin aplicada.
   * @param {{status?: string, permissions?: string[]}} changes
   */
  review({ status, permissions }) {
    if (this.isAdmin()) throw new ValidationError('No se puede modificar el acceso de un administrador');
    if (status !== undefined && !Object.values(USER_STATUS).includes(status)) {
      throw new ValidationError('Estado inválido');
    }
    return new User({
      ...this,
      status: status !== undefined ? status : this.status,
      permissions: permissions !== undefined ? User.normalizePermissions(permissions) : this.permissions,
    });
  }

  toPublic() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      status: this.status,
      permissions: this.isAdmin() ? Object.values(PERMISSIONS) : this.permissions,
      createdAt: this.createdAt,
    };
  }
}

module.exports = { User, ROLES, USER_STATUS, PERMISSIONS };
