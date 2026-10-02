/**
 * Plantillas de correo de pedidos. Devuelven { subject, html, text }: HTML con estilos en línea
 * (lo que soportan los clientes de correo) y una versión de texto plano.
 */
const money = new Intl.NumberFormat('es', { style: 'currency', currency: 'USD' });
const date = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Mexico_City' });

const STORE = 'Materiales El Constructor';
const ACCENT = '#c2410c';

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const itemsTable = (order) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;margin:8px 0 4px">
    <thead>
      <tr style="background:#f5f1ec;text-align:left">
        <th style="padding:8px;border-bottom:2px solid #1f1a17">Material</th>
        <th style="padding:8px;border-bottom:2px solid #1f1a17;text-align:right">Cantidad</th>
        <th style="padding:8px;border-bottom:2px solid #1f1a17;text-align:right">Precio</th>
        <th style="padding:8px;border-bottom:2px solid #1f1a17;text-align:right">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${order.items
        .map(
          (i) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e5ded6">${esc(i.productName)}</td>
        <td style="padding:8px;border-bottom:1px solid #e5ded6;text-align:right">${i.quantity} ${esc(i.unit)}</td>
        <td style="padding:8px;border-bottom:1px solid #e5ded6;text-align:right">${money.format(i.price)}</td>
        <td style="padding:8px;border-bottom:1px solid #e5ded6;text-align:right">${money.format(i.price * i.quantity)}</td>
      </tr>`,
        )
        .join('')}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3" style="padding:10px 8px;text-align:right;font-weight:bold">Total a pagar</td>
        <td style="padding:10px 8px;text-align:right;font-weight:bold;font-size:16px;color:${ACCENT}">${money.format(order.total)}</td>
      </tr>
    </tfoot>
  </table>`;

const itemsText = (order) =>
  order.items.map((i) => `- ${i.productName}: ${i.quantity} ${i.unit} x ${money.format(i.price)} = ${money.format(i.price * i.quantity)}`).join('\n');

const layout = (title, body) => `<!doctype html>
<html lang="es"><body style="margin:0;background:#f3efe9;font-family:Arial,Helvetica,sans-serif;color:#1f1a17">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3efe9;padding:24px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden">
        <tr><td style="background:#1f1a17;color:#ffffff;padding:18px 24px;font-size:18px;font-weight:bold">
          <span style="display:inline-block;width:12px;height:12px;background:${ACCENT};border-radius:2px;margin-right:8px"></span>${STORE}
        </td></tr>
        <tr><td style="padding:24px">
          <h1 style="margin:0 0 12px;font-size:22px">${title}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:14px 24px;background:#f5f1ec;color:#6b625b;font-size:12px">
          Este es un correo automático de ${STORE}. Por favor no respondas a este mensaje.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

/** Comprobante para el cliente con el desglose y los datos bancarios. */
function orderConfirmationEmail(order, payment) {
  const subject = `Pedido #${order.id} recibido — pendiente de pago (${money.format(order.total)})`;

  const html = layout(
    `¡Gracias por tu pedido #${order.id}!`,
    `
    <p style="margin:0 0 12px;font-size:15px;line-height:1.5">
      Registramos tu pedido el ${date.format(new Date(order.createdAt))} y su estado es
      <strong style="color:${ACCENT}">Pendiente de pago</strong>: lo apartamos y lo confirmaremos en cuanto recibamos tu pago.
    </p>
    <h2 style="font-size:16px;margin:20px 0 4px">Resumen de la compra</h2>
    ${itemsTable(order)}
    <h2 style="font-size:16px;margin:24px 0 8px">Instrucciones de pago</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid ${ACCENT};border-radius:6px;background:#fff7f1;font-size:14px">
      <tr><td style="padding:14px 16px;line-height:1.7">
        Realiza una transferencia o depósito por <strong>${money.format(order.total)}</strong> a:<br>
        <strong>Banco:</strong> ${esc(payment.bank)}<br>
        <strong>Titular:</strong> ${esc(payment.accountHolder)}<br>
        <strong>Cuenta:</strong> ${esc(payment.accountNumber)}<br>
        <strong>CLABE:</strong> ${esc(payment.clabe)}<br>
        <strong>Referencia / concepto:</strong> <span style="font-family:Consolas,monospace;font-size:15px;background:#ffffff;padding:2px 6px;border-radius:3px">${esc(payment.reference)}</span>
      </td></tr>
    </table>
    <ol style="font-size:14px;line-height:1.6;padding-left:20px;margin:16px 0 0">
      <li>Escribe la referencia <strong>${esc(payment.reference)}</strong> en el concepto del pago.</li>
      <li>Paga antes del <strong>${date.format(new Date(payment.dueAt))}</strong> (${payment.deadlineHours} horas); después el pedido se cancela y el material vuelve al inventario.</li>
      <li>Conserva tu comprobante: al validarlo cambiaremos el pedido a <em>Confirmado</em> y podrás seguirlo en «Mis pedidos».</li>
    </ol>`,
  );

  const text = `Gracias por tu pedido #${order.id} en ${STORE}.
Estado: Pendiente de pago.

Resumen:
${itemsText(order)}
Total a pagar: ${money.format(order.total)}

Instrucciones de pago (transferencia o depósito):
Banco: ${payment.bank}
Titular: ${payment.accountHolder}
Cuenta: ${payment.accountNumber}
CLABE: ${payment.clabe}
Referencia: ${payment.reference}
Fecha límite: ${date.format(new Date(payment.dueAt))}
`;

  return { subject, html, text };
}

/** Aviso interno para el administrador. */
function newOrderAlertEmail(order, payment) {
  const subject = `Nuevo pedido #${order.id} de ${order.userEmail} — ${money.format(order.total)}`;

  const html = layout(
    `Nuevo pedido #${order.id}`,
    `
    <p style="margin:0 0 12px;font-size:15px;line-height:1.5">
      <strong>${esc(order.userEmail)}</strong> generó un pedido el ${date.format(new Date(order.createdAt))},
      que quedó en <strong style="color:${ACCENT}">Pendiente de pago</strong> con la referencia
      <span style="font-family:Consolas,monospace">${esc(payment.reference)}</span>.
    </p>
    ${itemsTable(order)}
    <p style="font-size:14px;line-height:1.5;margin:16px 0 0">
      Cuando el pago con esa referencia aparezca en la cuenta, cambia el pedido a <em>Confirmado</em> desde la pantalla «Pedidos».
      Si no se paga antes del ${date.format(new Date(payment.dueAt))}, cancélalo para devolver el stock.
    </p>`,
  );

  const text = `Nuevo pedido #${order.id} de ${order.userEmail}
Referencia: ${payment.reference} — Pendiente de pago

${itemsText(order)}
Total: ${money.format(order.total)}
`;

  return { subject, html, text };
}

module.exports = { orderConfirmationEmail, newOrderAlertEmail };
