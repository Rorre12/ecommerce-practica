const nodemailer = require('nodemailer');
const EmailServicePort = require('../../../domain/ports/EmailServicePort');
const { orderConfirmationEmail, newOrderAlertEmail } = require('./templates/orderEmails');

/**
 * Adaptador de salida: implementa EmailServicePort con Nodemailer sobre SMTP.
 * Sirve para Mailtrap, Ethereal o cualquier servidor SMTP real cambiando solo variables de entorno.
 */
class NodemailerEmailAdapter extends EmailServicePort {
  /**
   * @param {{
   *   transport: import('nodemailer').Transporter,
   *   from: string,
   *   adminEmail: string,
   *   logger?: Pick<Console, 'log'>,
   * }} deps
   */
  constructor({ transport, from, adminEmail, logger = console }) {
    super();
    if (!adminEmail) throw new Error('ADMIN_NOTIFY_EMAIL (o ADMIN_EMAIL) es obligatorio');
    this.transport = transport;
    this.from = from;
    this.adminEmail = adminEmail;
    this.logger = logger;
  }

  /**
   * Usa el SMTP configurado (SMTP_HOST…) o, si no hay, crea al vuelo una cuenta de pruebas de Ethereal.
   * @param {NodeJS.ProcessEnv} env
   */
  static async fromEnv(env = process.env) {
    let smtp;
    if (env.SMTP_HOST) {
      smtp = {
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT) || 587,
        secure: env.SMTP_SECURE === 'true',
        auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      };
    } else {
      const account = await nodemailer.createTestAccount();
      smtp = { ...account.smtp, auth: { user: account.user, pass: account.pass } };
      console.log(`Correo: sin SMTP_HOST, usando Ethereal (${account.user} / ${account.pass}) → https://ethereal.email/login`);
    }

    return new NodemailerEmailAdapter({
      transport: nodemailer.createTransport(smtp),
      from: env.MAIL_FROM || '"Materiales El Constructor" <pedidos@elconstructor.test>',
      adminEmail: env.ADMIN_NOTIFY_EMAIL || env.ADMIN_EMAIL,
    });
  }

  async sendOrderConfirmation(order, payment) {
    await this.send(order.userEmail, orderConfirmationEmail(order, payment));
  }

  async sendNewOrderAlert(order, payment) {
    await this.send(this.adminEmail, newOrderAlertEmail(order, payment));
  }

  async send(to, { subject, html, text }) {
    const info = await this.transport.sendMail({ from: this.from, to, subject, html, text });
    const preview = nodemailer.getTestMessageUrl(info);
    this.logger.log(`Correo enviado a ${to}: "${subject}"${preview ? ` → ${preview}` : ''}`);
  }
}

module.exports = NodemailerEmailAdapter;
