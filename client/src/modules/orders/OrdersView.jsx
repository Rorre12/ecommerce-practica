import { useCallback, useEffect, useState } from 'react';
import { Ban, CircleCheck, PackageCheck, Receipt, Truck } from 'lucide-react';
import { api } from '../../api.js';
import { ORDER_STATUS_LABELS, formatDate, formatMoney } from '../../format.js';
import { Alert, Empty, Loading, PageHeader, StatusPill } from '../../components/ui.jsx';

const ACTIONS = {
  CONFIRMED: { label: 'Confirmar', icon: CircleCheck },
  SHIPPED: { label: 'Enviar', icon: Truck },
  DELIVERED: { label: 'Entregar', icon: PackageCheck },
  CANCELLED: { label: 'Cancelar', icon: Ban },
};

/**
 * manage=false: "Mis pedidos" (solo lectura).
 * manage=true: gestión de todos los pedidos (admin o permiso ORDERS), permite cambiar el estado.
 */
export default function OrdersView({ token, manage = false }) {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await (manage ? api.listAllOrders(token) : api.listMyOrders(token)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, manage]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async (order, status) => {
    // Cancelar es irreversible (estado final), por eso es la única acción que pide confirmación
    if (
      status === 'CANCELLED' &&
      !window.confirm(`¿Cancelar el pedido #${order.id}? El stock se devolverá al inventario.`)
    ) {
      return;
    }
    setError('');
    setMessage('');
    setUpdatingId(order.id);
    try {
      const updated = await api.changeOrderStatus(token, order.id, status);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setMessage(`Pedido #${updated.id}: ${ORDER_STATUS_LABELS[updated.status]}`);
    } catch (err) {
      setError(err.message);
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const visible = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders;

  return (
    <section>
      <PageHeader
        title={manage ? 'Pedidos' : 'Mis pedidos'}
        description={
          manage
            ? 'Todos los pedidos de la tienda. Avanza cada uno por su ciclo: confirmado, enviado y entregado.'
            : 'Historial de tus compras y el estado de cada entrega.'
        }
      >
        <label>
          Estado
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </PageHeader>

      <Alert type="error">{error}</Alert>
      <Alert type="success">{message}</Alert>

      <div className="card">
        {loading ? (
          <Loading />
        ) : visible.length === 0 ? (
          <Empty icon={Receipt}>{orders.length === 0 ? 'Aún no hay pedidos.' : 'No hay pedidos con ese estado.'}</Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="num">N.º</th>
                  <th>Fecha</th>
                  {manage && <th>Cliente</th>}
                  <th>Materiales</th>
                  <th className="num">Total</th>
                  <th>Estado</th>
                  {manage && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <tr key={o.id}>
                    <td className="num">{o.id}</td>
                    <td className="nowrap">{formatDate(o.createdAt)}</td>
                    {manage && <td>{o.userEmail}</td>}
                    <td>
                      <ul className="items">
                        {o.items.map((i) => (
                          <li key={i.id}>
                            {i.quantity} {i.unit} × {i.productName}{' '}
                            <span className="unit">({formatMoney(i.price)})</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="num">
                      <strong>{formatMoney(o.total)}</strong>
                    </td>
                    <td>
                      <StatusPill status={o.status} />
                    </td>
                    {manage && (
                      <td>
                        {o.nextStatuses.length === 0 ? (
                          <span className="muted small">Finalizado</span>
                        ) : (
                          <div className="actions">
                            {o.nextStatuses.map((s) => {
                              const { label, icon: Icon } = ACTIONS[s];
                              return (
                                <button
                                  key={s}
                                  className={s === 'CANCELLED' ? 'danger' : 'secondary'}
                                  disabled={updatingId === o.id}
                                  onClick={() => handleStatus(o, s)}
                                >
                                  <Icon size={16} aria-hidden="true" />
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
