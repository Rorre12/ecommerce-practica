const { ValidationError } = require('../errors');

class Order {
  constructor({ id, userId, userEmail, total, createdAt, items = [] }) {
    this.id = id;
    this.userId = userId;
    this.userEmail = userEmail;
    this.total = total;
    this.createdAt = createdAt;
    // items: [{ id?, productId, productName, quantity, price }]
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
}

module.exports = { Order };
