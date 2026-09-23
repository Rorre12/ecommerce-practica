import { useCallback, useEffect, useState } from 'react';
import { onUnauthorized } from './api.js';
import AuthView from './modules/auth/AuthView.jsx';
import ProductsView from './modules/products/ProductsView.jsx';
import OrdersView from './modules/orders/OrdersView.jsx';

const SESSION_KEY = 'ecommerce.session';

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState(loadSession);
  const [view, setView] = useState('products');

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  useEffect(() => onUnauthorized(logout), [logout]);

  const handleAuthenticated = (newSession) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
    setView('products');
  };

  if (!session) return <AuthView onAuthenticated={handleAuthenticated} />;

  const { token, user } = session;
  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="container">
      <header className="topbar">
        <h1>Mini Tienda</h1>
        <nav>
          <button className={view === 'products' ? 'tab active' : 'tab'} onClick={() => setView('products')}>
            Productos
          </button>
          <button className={view === 'orders' ? 'tab active' : 'tab'} onClick={() => setView('orders')}>
            Pedidos
          </button>
        </nav>
        <div className="user">
          <span>
            {user.email} <small className="badge">{user.role}</small>
          </span>
          <button className="secondary" onClick={logout}>
            Salir
          </button>
        </div>
      </header>

      <main>
        {view === 'products' ? (
          <ProductsView token={token} isAdmin={isAdmin} />
        ) : (
          <OrdersView token={token} isAdmin={isAdmin} />
        )}
      </main>
    </div>
  );
}
