import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../api.js';
import { formatDate, formatMoney } from '../../format.js';

export default function OrdersView({ token, isAdmin }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]); // [{ productId, quantity }]
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [productList, orderList] = await Promise.all([api.listProducts(), api.listOrders(token)]);
      setProducts(productList);
      setOrders(orderList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const cartTotal = cart.reduce((acc, line) => acc + (productsById.get(line.productId)?.price || 0) * line.quantity, 0);

  const handleAdd = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const id = Number(productId);
    const qty = Number(quantity);
    const product = productsById.get(id);
    if (!product) return setError('Selecciona un producto');
    if (!Number.isInteger(qty) || qty <= 0) return setError('La cantidad debe ser un entero mayor a 0');

    const alreadyInCart = cart.find((l) => l.productId === id)?.quantity || 0;
    if (alreadyInCart + qty > product.stock) {
      return setError(`Stock insuficiente para "${product.name}" (disponible: ${product.stock})`);
    }

    setCart((prev) =>
      alreadyInCart
        ? prev.map((l) => (l.productId === id ? { ...l, quantity: l.quantity + qty } : l))
        : [...prev, { productId: id, quantity: qty }],
    );
    setQuantity(1);
  };

  const handleRemove = (id) => setCart((prev) => prev.filter((l) => l.productId !== id));

  const handleSubmitOrder = async () => {
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const order = await api.createOrder(token, cart);
      setMessage(`Pedido #${order.id} creado por ${formatMoney(order.total)}`);
      setCart([]);
      setProductId('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <h2>Pedidos</h2>

      <div className="card">
        <h3>Nuevo pedido</h3>
        <form className="row" onSubmit={handleAdd}>
          <label>
            Producto
            <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
              <option value="">-- Selecciona --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id} disabled={p.stock === 0}>
                  {p.name} — {formatMoney(p.price)} (stock: {p.stock})
                </option>
              ))}
            </select>
          </label>
          <label>
            Cantidad
            <input type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </label>
          <button type="submit" className="align-end">
            Agregar
          </button>
        </form>

        {cart.length > 0 && (
          <>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="num">Cantidad</th>
                  <th className="num">Subtotal</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cart.map((line) => {
                  const product = productsById.get(line.productId);
                  return (
                    <tr key={line.productId}>
                      <td>{product?.name}</td>
                      <td className="num">{line.quantity}</td>
                      <td className="num">{formatMoney((product?.price || 0) * line.quantity)}</td>
                      <td className="actions">
                        <button className="danger" onClick={() => handleRemove(line.productId)}>
                          Quitar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="cart-footer">
              <strong>Total: {formatMoney(cartTotal)}</strong>
              <button onClick={handleSubmitOrder} disabled={submitting}>
                {submitting ? 'Enviando...' : 'Confirmar pedido'}
              </button>
            </div>
          </>
        )}
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="card">
        <h3>{isAdmin ? 'Historial de todos los pedidos' : 'Mi historial de pedidos'}</h3>
        {loading ? (
          <p className="muted">Cargando...</p>
        ) : orders.length === 0 ? (
          <p className="muted">Aún no hay pedidos.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                {isAdmin && <th>Cliente</th>}
                <th>Productos</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{formatDate(o.createdAt)}</td>
                  {isAdmin && <td>{o.userEmail}</td>}
                  <td>
                    <ul className="items">
                      {o.items.map((i) => (
                        <li key={i.id}>
                          {i.quantity} × {i.productName} ({formatMoney(i.price)})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="num">{formatMoney(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
