const UserRepository = require('../../../domain/ports/UserRepository');
const { User } = require('../../../domain/entities/User');
const { NotFoundError } = require('../../../domain/errors');

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

  async findAll({ status } = {}) {
    const rows = await this.prisma.user.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toUser);
  }

  async save(user) {
    const row = await this.prisma.user.create({
      data: {
        email: user.email,
        password: user.password,
        role: user.role,
        status: user.status,
        permissions: user.permissions,
      },
    });
    return toUser(row);
  }

  async update(user) {
    try {
      const row = await this.prisma.user.update({
        where: { id: user.id },
        data: { status: user.status, permissions: user.permissions },
      });
      return toUser(row);
    } catch (err) {
      if (err.code === 'P2025') throw new NotFoundError(`Usuario ${user.id} no encontrado`);
      throw err;
    }
  }
}

module.exports = PrismaUserRepository;
