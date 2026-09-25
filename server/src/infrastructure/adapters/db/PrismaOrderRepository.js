const OrderRepository = require('../../../domain/ports/OrderRepository');
const { Order, ORDER_STATUS } = require('../../../domain/entities/Order');
const { InsufficientStockError, ConflictError } = require('../../../domain/errors');

const orderInclude = {
  user: { select: { email: true } },
  items: {
    include: { product: { select: { name: true, unit: true } } },
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
        status: row.status,
        createdAt: row.createdAt,
        items: row.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.product?.name,
          unit: item.product?.unit,
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

  async updateStatus(order, status) {
    return this.prisma.$transaction(async (tx) => {
      // Condicionado al estado leído: si otro usuario lo cambió antes, no se pisa
      const { count } = await tx.order.updateMany({
        where: { id: order.id, status: order.status },
        data: { status },
      });
      if (count === 0) {
        throw new ConflictError(`El pedido ${order.id} fue modificado por otro usuario. Recarga e intenta de nuevo`);
      }

      if (status === ORDER_STATUS.CANCELLED) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return toOrder(await tx.order.findUnique({ where: { id: order.id }, include: orderInclude }));
    });
  }
}

module.exports = PrismaOrderRepository;
