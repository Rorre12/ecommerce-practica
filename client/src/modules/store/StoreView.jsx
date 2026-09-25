import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ban, Minus, PackageCheck, Plus, Search, ShoppingCart, Trash2 } from 'lucide-react';
import { api } from '../../api.js';
import { formatMoney } from '../../format.js';
import { Alert, CategoryIcon, Empty, Loading, PageHeader } from '../../components/ui.jsx';

const ALL = 'Todas';

export default function StoreView({ token, onOrderCreated }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); // [{ productId, quantity }]
  const [quantities, setQuantities] = useState({}); // cantidad elegida en cada tarjeta
  const [category, setCategory] = useState(ALL);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await api.listProducts());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const categories = useMemo(() => [ALL, ...new Set(products.map((p) => p.category))], [products]);

  const visible = products.filter(
    (p) =>
      (category === ALL || p.category === category) && p.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const inCart = (id) => cart.find((l) => l.productId === id)?.quantity || 0;
  const cartTotal = cart.reduce((acc, line) => acc + (productsById.get(line.productId)?.price || 0) * line.quantity, 0);

  const qtyOf = (id) => Number(quantities[id]) || 1;
  const setQty = (id, value) => setQuantities((prev) => ({ ...prev, [id]: value }));

  const handleAdd = (product) => {
    setError('');
    setMessage('');
    const qty = qtyOf(product.id);
    if (!Number.isInteger(qty) || qty <= 0) return setError('La cantidad debe ser un entero mayor a 0');
    if (inCart(product.id) + qty > product.stock) {
      return setError(`Stock insuficiente para “${product.name}” (disponible: ${product.stock} ${product.unit})`);
    }
    setCart((prev) =>
      inCart(product.id)
        ? prev.map((l) => (l.productId === product.id ? { ...l, quantity: l.quantity + qty } : l))
        : [...prev, { productId: product.id, quantity: qty }],
    );
    setQty(product.id, '');
  };

  const handleRemove = (id) => setCart((prev) => prev.filter((l) => l.productId !== id));

  const handleCheckout = async () => {
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const order = await api.createOrder(token, cart);
      setCart([]);
      setMessage(`Pedido #${order.id} creado por ${formatMoney(order.total)}`);
      await load();
      onOrderCreated?.(order);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Tienda" description="Materiales disponibles para entrega. Precios por unidad de venta." />

      <section className="store">
        <div>
          <div className="store-filters">
            <label className="search">
              Buscar material
              <span className="search-field">
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Cemento, varilla, block…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </span>
            </label>
            <div className="chips" role="group" aria-label="Filtrar por categoría">
              {categories.map((c) => (
                <button
                  key={c}
                  className="chip"
                  aria-pressed={c === category}
                  onClick={() => setCategory(c)}
                >
                  {c !== ALL && <CategoryIcon category={c} size={15} />}
                  {c}
                </button>
              ))}
            </div>
          </div>

          <Alert type="error">{error}</Alert>
          <Alert type="success">{message}</Alert>

          {loading ? (
            <Loading>Cargando catálogo…</Loading>
          ) : visible.length === 0 ? (
            <Empty icon={Search}>No hay materiales que coincidan con la búsqueda.</Empty>
          ) : (
            <div className="product-grid">
              {visible.map((p) => {
                const soldOut = p.stock === 0;
                return (
                  <article key={p.id} className="product-card">
                    <span className="category">
                      <CategoryIcon category={p.category} />
                      {p.category}
                    </span>
                    <h3>{p.name}</h3>
                    <p className="price">
                      <strong>{formatMoney(p.price)}</strong>
                      <span className="unit">/ {p.unit}</span>
                    </p>
                    <p className={soldOut ? 'stock out' : 'stock'}>
                      {soldOut ? <Ban size={14} aria-hidden="true" /> : <PackageCheck size={14} aria-hidden="true" />}
                      {soldOut ? 'Agotado' : `${p.stock} ${p.unit} disponibles`}
                    </p>
                    <div className="add-row">
                      <div className="stepper">
                        <button
                          type="button"
                          aria-label={`Menos ${p.name}`}
                          disabled={soldOut || qtyOf(p.id) <= 1}
                          onClick={() => setQty(p.id, qtyOf(p.id) - 1)}
                        >
                          <Minus size={16} aria-hidden="true" />
                        </button>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          step="1"
                          placeholder="1"
                          value={quantities[p.id] ?? ''}
                          onChange={(e) => setQty(p.id, e.target.value)}
                          disabled={soldOut}
                          aria-label={`Cantidad de ${p.name}`}
                        />
                        <button
                          type="button"
                          aria-label={`Más ${p.name}`}
                          disabled={soldOut}
                          onClick={() => setQty(p.id, qtyOf(p.id) + 1)}
                        >
                          <Plus size={16} aria-hidden="true" />
                        </button>
                      </div>
                      <button onClick={() => handleAdd(p)} disabled={soldOut}>
                        <ShoppingCart size={16} aria-hidden="true" />
                        Agregar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className="card cart" aria-label="Carrito">
          <h3>
            <ShoppingCart size={20} aria-hidden="true" />
            Carrito
            {cart.length > 0 && (
              <span className="count" aria-label={`${cart.length} productos`}>
                {cart.length}
              </span>
            )}
          </h3>
          {cart.length === 0 ? (
            <p className="muted small">Agrega materiales desde el catálogo para armar tu pedido.</p>
          ) : (
            <>
              <ul className="cart-lines">
                {cart.map((line) => {
                  const product = productsById.get(line.productId);
                  return (
                    <li key={line.productId}>
                      <div>
                        <strong>{product?.name}</strong>
                        <span className="muted tabular">
                          {line.quantity} {product?.unit} × {formatMoney(product?.price)}
                        </span>
                      </div>
                      <div className="line-end">
                        <span>{formatMoney((product?.price || 0) * line.quantity)}</span>
                        <button className="remove" onClick={() => handleRemove(line.productId)}>
                          <Trash2 size={13} aria-hidden="true" />
                          Quitar
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="cart-total">
                <span className="muted">Total</span>
                <strong>{formatMoney(cartTotal)}</strong>
              </p>
              <button className="accent" onClick={handleCheckout} disabled={submitting}>
                {submitting ? 'Enviando…' : 'Confirmar pedido'}
              </button>
            </>
          )}
        </aside>
      </section>
    </>
  );
}
