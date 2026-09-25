import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, LogOut, Package, Receipt, Store, Users } from 'lucide-react';
import { api, onUnauthorized } from './api.js';
import { BrandMark } from './components/ui.jsx';
import AuthView from './modules/auth/AuthView.jsx';
import StoreView from './modules/store/StoreView.jsx';
import ProductsView from './modules/products/ProductsView.jsx';
import OrdersView from './modules/orders/OrdersView.jsx';
import UsersView from './modules/users/UsersView.jsx';

const SESSION_KEY = 'ecommerce.session';

// Pantallas disponibles y quién puede verlas. El backend aplica las mismas reglas.
const VIEWS = [
  { id: 'store', label: 'Tienda', icon: Store, visible: () => true },
  { id: 'my-orders', label: 'Mis pedidos', icon: Receipt, visible: (user) => user.role !== 'ADMIN' },
  { id: 'products', label: 'Productos', icon: Package, visible: (user) => user.permissions.includes('PRODUCTS') },
  { id: 'orders', label: 'Pedidos', icon: ClipboardList, visible: (user) => user.permissions.includes('ORDERS') },
  { id: 'users', label: 'Usuarios', icon: Users, visible: (user) => user.role === 'ADMIN' },
];

function loadSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    return session?.user?.permissions ? session : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState(loadSession);
  const [view, setView] = useState('store');
  const [pendingCount, setPendingCount] = useState(0);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  useEffect(() => onUnauthorized(logout), [logout]);

  const saveSession = useCallback((newSession) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }, []);

  const token = session?.token;
  const isAdmin = session?.user.role === 'ADMIN';

  // Los permisos pueden cambiar mientras hay sesión abierta: se refrescan al cargar.
  useEffect(() => {
    if (!token) return;
    api
      .me(token)
      .then((user) => saveSession({ token, user }))
      .catch(logout);
  }, [token, saveSession, logout]);

  useEffect(() => {
    if (!token || !isAdmin) return;
    api
      .listUsers(token)
      .then((users) => setPendingCount(users.filter((u) => u.status === 'PENDING').length))
      .catch(() => {});
  }, [token, isAdmin]);

  if (!session) {
    return (
      <AuthView
        onAuthenticated={(newSession) => {
          saveSession(newSession);
          setView('store');
        }}
      />
    );
  }

  const { user } = session;
  const views = VIEWS.filter((v) => v.visible(user));
  const current = views.some((v) => v.id === view) ? view : 'store';

  return (
    <div className="app">
      <aside className="rail">
        <div className="brand">
          <BrandMark />
          <span className="brand-name">
            El Constructor
            <small>Materiales</small>
          </span>
        </div>

        <nav className="rail-nav" aria-label="Secciones">
          {views.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className="nav-item"
              aria-current={current === id ? 'page' : undefined}
              onClick={() => setView(id)}
            >
              <Icon size={20} aria-hidden="true" />
              {label}
              {id === 'users' && pendingCount > 0 && (
                <span className="count" aria-label={`${pendingCount} solicitudes pendientes`}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="rail-user">
          <div className="who">
            <span className="role">{isAdmin ? 'Administrador' : 'Cliente'}</span>
            <span>{user.email}</span>
          </div>
          <button onClick={logout}>
            <LogOut size={16} aria-hidden="true" />
            Salir
          </button>
        </div>
      </aside>

      <main className="content">
        {current === 'store' && <StoreView token={token} onOrderCreated={() => !isAdmin && setView('my-orders')} />}
        {current === 'my-orders' && <OrdersView token={token} />}
        {current === 'products' && <ProductsView token={token} />}
        {current === 'orders' && <OrdersView token={token} manage />}
        {current === 'users' && <UsersView token={token} onPendingChange={setPendingCount} />}
      </main>
    </div>
  );
}
