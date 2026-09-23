import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api.js';
import { formatMoney } from '../../format.js';

const EMPTY_FORM = { id: null, name: '', price: '', stock: '' };

export default function ProductsView({ token, isAdmin }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    const payload = { name: form.name.trim(), price: Number(form.price), stock: Number(form.stock) };
    try {
      if (form.id) {
        await api.updateProduct(token, form.id, payload);
        setMessage('Producto actualizado');
      } else {
        await api.createProduct(token, payload);
        setMessage('Producto creado');
      }
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setForm({ id: product.id, name: product.name, price: String(product.price), stock: String(product.stock) });
    setMessage('');
    setError('');
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`¿Eliminar "${product.name}"?`)) return;
    setError('');
    setMessage('');
    try {
      await api.deleteProduct(token, product.id);
      setMessage('Producto eliminado');
      if (form.id === product.id) setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <h2>Productos</h2>

      {isAdmin && (
        <form className="card form-inline" onSubmit={handleSubmit}>
          <h3>{form.id ? `Editar producto #${form.id}` : 'Nuevo producto'}</h3>
          <div className="row">
            <label>
              Nombre
              <input name="name" value={form.name} onChange={handleChange} required maxLength={120} />
            </label>
            <label>
              Precio
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
            </label>
            <label>
              Stock
              <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} required />
            </label>
          </div>
          <div className="actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : form.id ? 'Guardar cambios' : 'Crear producto'}
            </button>
            {form.id && (
              <button type="button" className="secondary" onClick={() => setForm(EMPTY_FORM)}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="card">
        {loading ? (
          <p className="muted">Cargando...</p>
        ) : products.length === 0 ? (
          <p className="muted">No hay productos registrados.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th className="num">Precio</th>
                <th className="num">Stock</th>
                {isAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td className="num">{formatMoney(p.price)}</td>
                  <td className={p.stock === 0 ? 'num out' : 'num'}>{p.stock}</td>
                  {isAdmin && (
                    <td className="actions">
                      <button className="secondary" onClick={() => handleEdit(p)}>
                        Editar
                      </button>
                      <button className="danger" onClick={() => handleDelete(p)}>
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
