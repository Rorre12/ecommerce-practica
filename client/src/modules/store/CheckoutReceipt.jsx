import { Landmark, Mail, MailWarning, Receipt } from 'lucide-react';
import { formatDate, formatMoney } from '../../format.js';
import { StatusPill } from '../../components/ui.jsx';

/** Comprobante que se muestra al confirmar el pedido: estado, datos bancarios y aviso del correo. */
export default function CheckoutReceipt({ order, onViewOrders, onContinue }) {
  const { payment, notifications } = order;

  return (
    <aside className="card cart receipt" aria-label={`Pedido ${order.id} registrado`}>
      <h3>
        <Receipt size={20} aria-hidden="true" />
        Pedido #{order.id} registrado
      </h3>
      <p className="receipt-status">
        <StatusPill status={order.status} />
        <strong className="tabular">{formatMoney(order.total)}</strong>
      </p>

      <div className="payment-box">
        <p className="payment-title">
          <Landmark size={16} aria-hidden="true" />
          Paga por transferencia o depósito
        </p>
        <dl>
          <dt>Banco</dt>
          <dd>{payment.bank}</dd>
          <dt>Titular</dt>
          <dd>{payment.accountHolder}</dd>
          <dt>Cuenta</dt>
          <dd className="tabular">{payment.accountNumber}</dd>
          <dt>CLABE</dt>
          <dd className="tabular">{payment.clabe}</dd>
          <dt>Referencia</dt>
          <dd>
            <code>{payment.reference}</code>
          </dd>
          <dt>Fecha límite</dt>
          <dd>{formatDate(payment.dueAt)}</dd>
        </dl>
      </div>

      {notifications.customerEmail ? (
        <p className="receipt-mail">
          <Mail size={16} aria-hidden="true" />
          <span>
            Te enviamos el comprobante y estas instrucciones a <strong>{order.userEmail}</strong>.
          </span>
        </p>
      ) : (
        <p className="receipt-mail warn">
          <MailWarning size={16} aria-hidden="true" />
          <span>No pudimos enviarte el correo. Guarda estos datos: el pedido sí quedó registrado.</span>
        </p>
      )}

      <div className="receipt-actions">
        <button className="accent" onClick={onViewOrders}>
          Ver mis pedidos
        </button>
        <button className="secondary" onClick={onContinue}>
          Seguir comprando
        </button>
      </div>
    </aside>
  );
}
