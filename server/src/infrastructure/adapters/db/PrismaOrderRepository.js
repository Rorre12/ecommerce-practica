const OrderRepository = require('../../../domain/ports/OrderRepository');
const { Order } = require('../../../domain/entities/Order');
const { InsufficientStockError } = require('../../../domain/errors');

const orderInclude = {
  user: { select: { email: true } },
  items: {
    include: { product: { select: { name: true } } },
    orderBy: { id: 'asc' },
  },
};

const toOrder = (row) =>
  row
    ? new Order({
        id: row.id,
        userId: row.userId,
        userEmail: row.user?.email,
        total: Number(row.total),
        createdAt: row.createdAt,
        items: row.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.product?.name,
          quantity: item.quantity,
          price: Number(item.price),
        })),
      })
    : null;

class PrismaOrderRepository extends OrderRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async create(order) {
    return this.prisma.$transaction(async (tx) => {
      // Descuento condicional: evita stock negativo ante pedidos concurrentes
      for (const item of order.items) {
        const { count } = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (count === 0) {
          throw new InsufficientStockError(`Stock insuficiente para "${item.productName}"`, {
            productId: item.productId,
            requested: item.quantity,
          });
        }
      }

      const row = await tx.order.create({
        data: {
          userId: order.userId,
          total: order.total,
          items: {
            create: order.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: orderInclude,
      });

      return toOrder(row);
    });
  }

  async findById(id) {
    return toOrder(await this.prisma.order.findUnique({ where: { id }, include: orderInclude }));
  }

  async findAll() {
    const rows = await this.prisma.order.findMany({ include: orderInclude, orderBy: { createdAt: 'desc' } });
    return rows.map(toOrder);
  }

  async findByUserId(userId) {
    const rows = await this.prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toOrder);
  }
}

module.exports = PrismaOrderRepository;
