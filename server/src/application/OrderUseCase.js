const { Order } = require('../domain/entities/Order');
const { ROLES } = require('../domain/entities/User');
const { ValidationError, NotFoundError } = require('../domain/errors');

class OrderUseCase {
  /**
   * @param {{
   *   orderRepository: import('../domain/ports/OrderRepository'),
   *   productRepository: import('../domain/ports/ProductRepository'),
   * }} deps
   */
  constructor({ orderRepository, productRepository }) {
    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
  }

  /**
   * @param {number} userId
   * @param {{productId: number, quantity: number}[]} rawItems
   */
  async create(userId, rawItems) {
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new ValidationError('El pedido debe contener al menos un producto');
    }

    // Agrupa cantidades si el mismo producto viene repetido
    const quantities = new Map();
    for (const item of rawItems) {
      const productId = Number(item?.productId);
      const quantity = Number(item?.quantity);
      if (!Number.isInteger(productId) || productId <= 0) {
        throw new ValidationError('productId inválido');
      }
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new ValidationError('La cantidad debe ser un entero mayor a 0');
      }
      quantities.set(productId, (quantities.get(productId) || 0) + quantity);
    }

    const products = await this.productRepository.findByIds([...quantities.keys()]);
    const productsById = new Map(products.map((p) => [p.id, p]));

    const lines = [...quantities].map(([productId, quantity]) => {
      const product = productsById.get(productId);
      if (!product) throw new NotFoundError(`Producto ${productId} no encontrado`);
      return { product, quantity };
    });

    const order = Order.create(userId, lines);
    return this.orderRepository.create(order);
  }

  /** ADMIN ve todos los pedidos; CUSTOMER solo los suyos. */
  list(requester) {
    return requester.role === ROLES.ADMIN
      ? this.orderRepository.findAll()
      : this.orderRepository.findByUserId(requester.id);
  }

  async getById(requester, id) {
    const order = await this.orderRepository.findById(id);
    if (!order || (requester.role !== ROLES.ADMIN && !order.belongsTo(requester.id))) {
      throw new NotFoundError(`Pedido ${id} no encontrado`);
    }
    return order;
  }
}

module.exports = OrderUseCase;
