// Pruebas del caso de uso con adaptadores falsos: demuestran que el núcleo no depende de Nodemailer.
const test = require('node:test');
const assert = require('node:assert/strict');
const OrderUseCase = require('../src/application/OrderUseCase');
const EmailServicePort = require('../src/domain/ports/EmailServicePort');
const { Product } = require('../src/domain/entities/Product');
const { Order } = require('../src/domain/entities/Order');

const cement = new Product({ id: 1, name: 'Cemento gris 50 kg', price: 9.5, stock: 100, unit: 'bulto', category: 'Cemento' });

const productRepository = { findByIds: async () => [cement] };
const orderRepository = {
  create: async (order) => new Order({ ...order, id: 42, userEmail: 'cliente@correo.com', createdAt: new Date('2026-10-02T15:00:00Z') }),
};
const paymentAccount = { bank: 'BBVA México', accountHolder: 'Materiales El Constructor', accountNumber: '0123456789', clabe: '012100001234567891' };

class FakeEmailService extends EmailServicePort {
  sent = [];
  async sendOrderConfirmation(order, payment) {
    this.sent.push({ to: order.userEmail, kind: 'confirmation', reference: payment.reference });
  }
  async sendNewOrderAlert(order) {
    this.sent.push({ to: 'admin', kind: 'alert', orderId: order.id });
  }
}

const silent = { error: () => {} };

test('al crear un pedido se envía el comprobante al cliente y el aviso al administrador', async () => {
  const emailService = new FakeEmailService();
  const useCase = new OrderUseCase({ orderRepository, productRepository, emailService, paymentAccount, logger: silent });

  const order = await useCase.create(7, [{ productId: 1, quantity: 3 }]);

  assert.equal(order.status, 'PENDING');
  assert.equal(order.total, 28.5);
  assert.equal(order.payment.reference, 'PED-000042');
  assert.equal(order.payment.clabe, paymentAccount.clabe);
  assert.deepEqual(order.notifications, { customerEmail: true, adminEmail: true });
  assert.deepEqual(emailService.sent, [
    { to: 'cliente@correo.com', kind: 'confirmation', reference: 'PED-000042' },
    { to: 'admin', kind: 'alert', orderId: 42 },
  ]);
});

test('si el proveedor de correo falla, el pedido igual queda registrado', async () => {
  class BrokenEmailService extends EmailServicePort {
    async sendOrderConfirmation() {
      throw new Error('SMTP caído');
    }
    async sendNewOrderAlert() {}
  }
  const useCase = new OrderUseCase({
    orderRepository,
    productRepository,
    emailService: new BrokenEmailService(),
    paymentAccount,
    logger: silent,
  });

  const order = await useCase.create(7, [{ productId: 1, quantity: 1 }]);

  assert.equal(order.id, 42);
  assert.deepEqual(order.notifications, { customerEmail: false, adminEmail: true });
});

test('la fecha límite de pago se calcula a partir del pedido', async () => {
  const useCase = new OrderUseCase({
    orderRepository,
    productRepository,
    emailService: new FakeEmailService(),
    paymentAccount: { ...paymentAccount, deadlineHours: 24 },
    logger: silent,
  });

  const { payment } = await useCase.create(7, [{ productId: 1, quantity: 1 }]);

  assert.equal(payment.dueAt.toISOString(), '2026-10-03T15:00:00.000Z');
});
