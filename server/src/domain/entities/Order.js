const { ValidationError } = require('../errors');

const ORDER_STATUS = Object.freeze({
  PENDING: 'PENDING', // pendiente de pago: no hay cobro en línea, el cliente paga por transferencia
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
});

// Ciclo de vida permitido de un pedido. DELIVERED y CANCELLED son finales.
const TRANSITIONS = Object.freeze({
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
});

class Order {
  constructor({ id, userId, userEmail, total, status = ORDER_STATUS.PENDING, createdAt, items = [] }) {
    this.id = id;
    this.userId = userId;
    this.userEmail = userEmail;
    this.total = total;
    this.status = status;
    this.createdAt = createdAt;
    // items: [{ id?, productId, productName, unit, quantity, price }]
    this.items = items;
  }

  /**
   * Construye un pedido validando cantidades y stock de cada producto.
   * El precio se congela al momento de la compra.
   * @param {number} userId
   * @param {{product: import('./Product').Product, quantity: number}[]} lines
   */
  static create(userId, lines) {
    if (!Array.isArray(lines) || lines.length === 0) {
      throw new ValidationError('El pedido debe contener al menos un producto');
    }

    const items = lines.map(({ product, quantity }) => {
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new ValidationError(`Cantidad inválida para "${product.name}"`);
      }
      product.assertStock(quantity);
      return {
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        quantity,
        price: product.price,
      };
    });

    // Se calcula en centavos para evitar errores de coma flotante
    const totalCents = items.reduce((acc, item) => acc + Math.round(item.price * 100) * item.quantity, 0);

    return new Order({ userId, items, total: totalCents / 100 });
  }

  belongsTo(userId) {
    return this.userId === userId;
  }

  /** Estados a los que puede pasar el pedido desde su estado actual. */
  nextStatuses() {
    return TRANSITIONS[this.status] || [];
  }

  /** Regla de negocio: solo se permiten las transiciones del ciclo de vida. */
  assertCanChangeTo(status) {
    if (!Object.values(ORDER_STATUS).includes(status)) {
      throw new ValidationError('Estado de pedido inválido');
    }
    if (!this.nextStatuses().includes(status)) {
      throw new ValidationError(`No se puede cambiar un pedido de ${this.status} a ${status}`);
    }
  }

  toJSON() {
    return { ...this, nextStatuses: this.nextStatuses() };
  }
}

module.exports = { Order, ORDER_STATUS };
