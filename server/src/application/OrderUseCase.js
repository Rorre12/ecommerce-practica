const { Order } = require('../domain/entities/Order');
const { PaymentInstructions } = require('../domain/entities/PaymentInstructions');
const { PERMISSIONS } = require('../domain/entities/User');
const { ValidationError, NotFoundError, ForbiddenError } = require('../domain/errors');

class OrderUseCase {
  /**
   * @param {{
   *   orderRepository: import('../domain/ports/OrderRepository'),
   *   productRepository: import('../domain/ports/ProductRepository'),
   *   emailService: import('../domain/ports/EmailServicePort'),
   *   paymentAccount: {bank: string, accountHolder: string, accountNumber: string, clabe: string, deadlineHours?: number},
   *   logger?: Pick<Console, 'error'>,
   * }} deps
   */
  constructor({ orderRepository, productRepository, emailService, paymentAccount, logger = console }) {
    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
    this.emailService = emailService;
    this.paymentAccount = paymentAccount;
    this.logger = logger;
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

    const order = await this.orderRepository.create(Order.create(userId, lines));
    const payment = PaymentInstructions.forOrder(order, this.paymentAccount);
    const notifications = await this.notifyNewOrder(order, payment);

    return { ...order.toJSON(), payment, notifications };
  }

  /**
   * El pedido ya quedó registrado como "pendiente de pago": si un correo falla no se revierte,
   * solo se informa para que el cliente conserve las instrucciones que muestra la pantalla.
   */
  async notifyNewOrder(order, payment) {
    const [customer, admin] = await Promise.allSettled([
      this.emailService.sendOrderConfirmation(order, payment),
      this.emailService.sendNewOrderAlert(order, payment),
    ]);
    for (const [who, result] of [['cliente', customer], ['administrador', admin]]) {
      if (result.status === 'rejected') {
        this.logger.error(`No se pudo enviar el correo al ${who} del pedido #${order.id}:`, result.reason?.message);
      }
    }
    return { customerEmail: customer.status === 'fulfilled', adminEmail: admin.status === 'fulfilled' };
  }

  /**
   * scope "mine": pedidos propios (cualquier usuario).
   * scope "all": todos los pedidos (admin o permiso ORDERS).
   * @param {import('../domain/entities/User').User} requester
   */
  list(requester, scope = 'mine') {
    if (scope === 'all') {
      if (!requester.can(PERMISSIONS.ORDERS)) throw new ForbiddenError();
      return this.orderRepository.findAll();
    }
    return this.orderRepository.findByUserId(requester.id);
  }

  async getById(requester, id) {
    const order = await this.orderRepository.findById(id);
    if (!order || (!requester.can(PERMISSIONS.ORDERS) && !order.belongsTo(requester.id))) {
      throw new NotFoundError(`Pedido ${id} no encontrado`);
    }
    return order;
  }

  /** Avanza o cancela un pedido. La autorización la aplica el adaptador HTTP. */
  async changeStatus(id, status) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundError(`Pedido ${id} no encontrado`);
    order.assertCanChangeTo(status);
    return this.orderRepository.updateStatus(order, status);
  }
}

module.exports = OrderUseCase;
