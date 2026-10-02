/**
 * Puerto de salida: notificaciones por correo electrónico.
 * El núcleo solo conoce este contrato; el proveedor (Nodemailer, SMTP, API…) vive en un adaptador.
 */
class EmailServicePort {
  /**
   * Envía al cliente el comprobante del pedido y las instrucciones para pagarlo.
   * @param {import('../entities/Order').Order} _order
   * @param {import('../entities/PaymentInstructions').PaymentInstructions} _payment
   * @returns {Promise<void>}
   */
  async sendOrderConfirmation(_order, _payment) {
    throw new Error('EmailServicePort.sendOrderConfirmation no implementado');
  }

  /**
   * Avisa al administrador que llegó un pedido nuevo.
   * @param {import('../entities/Order').Order} _order
   * @param {import('../entities/PaymentInstructions').PaymentInstructions} _payment
   * @returns {Promise<void>}
   */
  async sendNewOrderAlert(_order, _payment) {
    throw new Error('EmailServicePort.sendNewOrderAlert no implementado');
  }
}

module.exports = EmailServicePort;
