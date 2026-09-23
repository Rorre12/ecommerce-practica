import { useState } from 'react';
import { api } from '../../api.js';

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
      const session = isLogin ? await api.login(email, password) : await api.register(email, password);
      onAuthenticated(session);
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
    <div className="auth-wrapper">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Mini Tienda</h1>
        <h2>{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</h2>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
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
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Procesando...' : isLogin ? 'Entrar' : 'Registrarme'}
        </button>

        <p className="muted">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button type="button" className="link" onClick={switchMode}>
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </form>
    </div>
  );
}
