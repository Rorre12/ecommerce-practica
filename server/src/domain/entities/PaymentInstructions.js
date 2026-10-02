const { ValidationError } = require('../errors');

/**
 * Datos para pagar un pedido por transferencia o depósito.
 * La referencia se deriva del pedido para que el administrador pueda conciliar el pago.
 */
class PaymentInstructions {
  constructor({ bank, accountHolder, accountNumber, clabe, deadlineHours = 48, reference, dueAt }) {
    this.bank = bank;
    this.accountHolder = accountHolder;
    this.accountNumber = accountNumber;
    this.clabe = clabe;
    this.deadlineHours = deadlineHours;
    this.reference = reference;
    this.dueAt = dueAt;
  }

  /** Referencia de pago única por pedido, p. ej. PED-000042. */
  static referenceFor(orderId) {
    return `PED-${String(orderId).padStart(6, '0')}`;
  }

  /**
   * Instrucciones concretas para un pedido a partir de los datos bancarios de la tienda.
   * @param {import('./Order').Order} order
   * @param {{bank: string, accountHolder: string, accountNumber: string, clabe: string, deadlineHours?: number}} account
   */
  static forOrder(order, account) {
    if (!account?.bank || !account?.clabe) {
      throw new ValidationError('Faltan los datos bancarios de la tienda');
    }
    const deadlineHours = Number(account.deadlineHours) || 48;
    const createdAt = new Date(order.createdAt ?? Date.now());
    return new PaymentInstructions({
      ...account,
      deadlineHours,
      reference: PaymentInstructions.referenceFor(order.id),
      dueAt: new Date(createdAt.getTime() + deadlineHours * 60 * 60 * 1000),
    });
  }
}

module.exports = { PaymentInstructions };
