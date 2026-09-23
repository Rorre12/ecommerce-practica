const jwt = require('jsonwebtoken');
const TokenService = require('../../../domain/ports/TokenService');
const { UnauthorizedError } = require('../../../domain/errors');

class JwtTokenService extends TokenService {
  constructor({ secret, expiresIn = '8h' }) {
    super();
    if (!secret) throw new Error('JWT_SECRET es obligatorio');
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  sign(user) {
    return jwt.sign({ email: user.email, role: user.role }, this.secret, {
      subject: String(user.id),
      expiresIn: this.expiresIn,
    });
  }

  verify(token) {
    try {
      const payload = jwt.verify(token, this.secret);
      return { id: Number(payload.sub), email: payload.email, role: payload.role };
    } catch {
      throw new UnauthorizedError('Token inválido o expirado');
    }
  }
}

module.exports = JwtTokenService;
