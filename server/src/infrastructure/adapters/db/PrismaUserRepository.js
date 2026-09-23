const UserRepository = require('../../../domain/ports/UserRepository');
const { User } = require('../../../domain/entities/User');

const toUser = (row) => (row ? new User(row) : null);

class PrismaUserRepository extends UserRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async findByEmail(email) {
    return toUser(await this.prisma.user.findUnique({ where: { email } }));
  }

  async findById(id) {
    return toUser(await this.prisma.user.findUnique({ where: { id } }));
  }

  async save(user) {
    const row = await this.prisma.user.create({
      data: { email: user.email, password: user.password, role: user.role },
    });
    return toUser(row);
  }
}

module.exports = PrismaUserRepository;
