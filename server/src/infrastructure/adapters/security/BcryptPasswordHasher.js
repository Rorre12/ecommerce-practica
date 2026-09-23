const bcrypt = require('bcryptjs');
const PasswordHasher = require('../../../domain/ports/PasswordHasher');

class BcryptPasswordHasher extends PasswordHasher {
  constructor(saltRounds = 10) {
    super();
    this.saltRounds = saltRounds;
  }

  hash(plain) {
    return bcrypt.hash(plain, this.saltRounds);
  }

  compare(plain, hash) {
    return bcrypt.compare(plain, hash);
  }
}

module.exports = BcryptPasswordHasher;
