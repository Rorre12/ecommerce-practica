import { useCallback, useEffect, useRef, useState } from 'react';
import { Package, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { api } from '../../api.js';
import { formatMoney } from '../../format.js';
import { Alert, CategoryIcon, Empty, Loading, PageHeader } from '../../components/ui.jsx';

const EMPTY_FORM = { id: null, name: '', price: '', stock: '', unit: '', category: '' };

/** Gestión del catálogo: visible para el admin y para usuarios con permiso PRODUCTS. */
export default function ProductsView({ token }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const nameRef = useRef(null);

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

  const units = [...new Set(products.map((p) => p.unit))];
  const categories = [...new Set(products.map((p) => p.category))];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      unit: form.unit.trim(),
      category: form.category.trim(),
    };
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
    setForm({
      id: product.id,
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      unit: product.unit,
      category: product.category,
    });
    setMessage('');
    setError('');
    nameRef.current?.focus();
  };

  const handleDelete = async (product) => {
    // Eliminar es irreversible: se confirma antes
    if (!window.confirm(`¿Eliminar “${product.name}”? Esta acción no se puede deshacer.`)) return;
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
      <PageHeader title="Productos" description="Catálogo de la tienda: precios, existencias y unidad de venta." />

      <form className="card" onSubmit={handleSubmit}>
        <h3>
          {form.id ? <Pencil size={20} aria-hidden="true" /> : <Plus size={20} aria-hidden="true" />}
          {form.id ? `Editar producto #${form.id}` : 'Nuevo producto'}
        </h3>
        <div className="row">
          <label>
            Nombre
            <input ref={nameRef} name="name" value={form.name} onChange={handleChange} required maxLength={120} />
          </label>
          <label>
            Precio (US$)
            <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
          </label>
          <label>
            Stock
            <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} required />
          </label>
        </div>
        <div className="row">
          <label>
            Unidad de venta
            <input
              name="unit"
              value={form.unit}
              onChange={handleChange}
              required
              maxLength={20}
              placeholder="saco, varilla, m³, pieza…"
              list="unit-options"
            />
          </label>
          <label>
            Categoría
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              maxLength={60}
              placeholder="Cementos, Acero…"
              list="category-options"
            />
          </label>
          <datalist id="unit-options">
            {units.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="form-actions">
          <button type="submit" className="accent" disabled={saving}>
            {form.id ? <Save size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
            {saving ? 'Guardando…' : form.id ? 'Guardar cambios' : 'Crear producto'}
          </button>
          {form.id && (
            <button type="button" className="secondary" onClick={() => setForm(EMPTY_FORM)}>
              <X size={16} aria-hidden="true" />
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <Alert type="error">{error}</Alert>
      <Alert type="success">{message}</Alert>

      <div className="card">
        {loading ? (
          <Loading />
        ) : products.length === 0 ? (
          <Empty icon={Package}>No hay productos registrados.</Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="num">ID</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th className="num">Precio</th>
                  <th className="num">Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="num">{p.id}</td>
                    <td>
                      <strong>{p.name}</strong>
                    </td>
                    <td>
                      <span className="tag">
                        <CategoryIcon category={p.category} size={13} />
                        {p.category}
                      </span>
                    </td>
                    <td className="num">
                      {formatMoney(p.price)} <span className="unit">/ {p.unit}</span>
                    </td>
                    <td className={p.stock === 0 ? 'num out' : 'num'}>{p.stock === 0 ? 'Agotado' : p.stock}</td>
                    <td className="actions">
                      <button className="secondary" onClick={() => handleEdit(p)}>
                        <Pencil size={16} aria-hidden="true" />
                        Editar
                      </button>
                      <button className="danger" onClick={() => handleDelete(p)}>
                        <Trash2 size={16} aria-hidden="true" />
                        Eliminar
                      </button>
                    </td>
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
