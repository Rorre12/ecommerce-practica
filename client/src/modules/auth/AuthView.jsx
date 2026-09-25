import { useState } from 'react';
import { BrickWall, LogIn, ShoppingCart, Truck, UserPlus } from 'lucide-react';
import { api } from '../../api.js';
import { Alert, BrandMark } from '../../components/ui.jsx';

export default function AuthView({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // El registro abre sesión de inmediato como comprador
      onAuthenticated(isLogin ? await api.login(email, password) : await api.register(email, password));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isLogin ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="auth">
      <aside className="auth-aside">
        <div className="brand">
          <BrandMark size={40} />
          <span className="brand-name">
            El Constructor
            <small>Materiales</small>
          </span>
        </div>

        <h1>
          Material para tu obra, <em>sin vueltas.</em>
        </h1>

        <ul className="auth-points">
          <li>
            <BrickWall size={20} aria-hidden="true" />
            Cemento, acero, agregados y mampostería
          </li>
          <li>
            <Truck size={20} aria-hidden="true" />
            Sigue cada pedido hasta la entrega
          </li>
          <li>
            <ShoppingCart size={20} aria-hidden="true" />
            Crea tu cuenta y compra al momento
          </li>
        </ul>
      </aside>

      <main className="auth-main">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <h2>{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</h2>
            {!isLogin && <p className="muted small">Podrás comprar en cuanto termines el registro.</p>}
          </div>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              maxLength={72}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              aria-describedby={isLogin ? undefined : 'password-help'}
            />
            {!isLogin && (
              <span id="password-help" className="muted small">
                Entre 6 y 72 caracteres.
              </span>
            )}
          </label>

          <Alert type="error">{error}</Alert>

          <button type="submit" className="accent" disabled={loading}>
            {isLogin ? <LogIn size={18} aria-hidden="true" /> : <UserPlus size={18} aria-hidden="true" />}
            {loading ? 'Procesando…' : isLogin ? 'Entrar' : 'Crear cuenta'}
          </button>

          <p className="muted small">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button type="button" className="link" onClick={switchMode}>
              {isLogin ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
        </form>
      </main>
    </div>
  );
}
