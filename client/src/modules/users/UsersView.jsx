import { useCallback, useEffect, useState } from 'react';
import { Inbox, RotateCcw, UserCheck, UserX, Users } from 'lucide-react';
import { api } from '../../api.js';
import { PERMISSION_OPTIONS, formatDate } from '../../format.js';
import { Alert, Empty, Loading, PageHeader, StatusPill } from '../../components/ui.jsx';

const toggle = (list, value) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

function PermissionChecks({ value, onChange, disabled }) {
  return (
    <div className="perm-checks">
      <label className="check" title="Todos los usuarios aprobados pueden comprar">
        <input type="checkbox" checked disabled /> Tienda
      </label>
      {PERMISSION_OPTIONS.map((p) => (
        <label key={p.value} className="check" title={p.hint}>
          <input
            type="checkbox"
            checked={value.includes(p.value)}
            disabled={disabled}
            onChange={() => onChange(toggle(value, p.value))}
          />{' '}
          {p.label}
        </label>
      ))}
    </div>
  );
}

/** Panel exclusivo del admin: solicitudes de registro y permisos de cada usuario. */
export default function UsersView({ token, onPendingChange }) {
  const [users, setUsers] = useState([]);
  const [drafts, setDrafts] = useState({}); // permisos elegidos para cada solicitud pendiente
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await api.listUsers(token));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const pending = users.filter((u) => u.status === 'PENDING');
  const registered = users.filter((u) => u.status !== 'PENDING');

  useEffect(() => {
    if (!loading) onPendingChange?.(pending.length);
  }, [loading, pending.length, onPendingChange]);

  // Actualización optimista: la casilla cambia al instante y se revierte si el servidor rechaza el cambio
  const review = async (user, changes, successMessage) => {
    setError('');
    setMessage('');
    setBusyId(user.id);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...changes } : u)));
    try {
      const updated = await api.reviewUser(token, user.id, changes);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setMessage(successMessage);
    } catch (err) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const approve = (user) => {
    const permissions = drafts[user.id] || [];
    review(user, { status: 'APPROVED', permissions }, `${user.email} aprobado`);
  };

  const reject = (user) => review(user, { status: 'REJECTED' }, `Acceso de ${user.email} revocado`);

  return (
    <section>
      <PageHeader
        title="Usuarios"
        description="Cada cuenta nueva entra como comprador. Marca las pantallas extra que puede usar cada persona o revócale el acceso."
      />

      <Alert type="error">{error}</Alert>
      <Alert type="success">{message}</Alert>

      {/* Solo cuentas creadas con el flujo anterior de aprobación previa */}
      {pending.length > 0 && (
        <div className="card">
          <h3>
            <Inbox size={20} aria-hidden="true" />
            Solicitudes pendientes <span className="count">{pending.length}</span>
          </h3>
          <ul className="requests">
            {pending.map((u) => (
              <li key={u.id}>
                <div className="who">
                  <strong>{u.email}</strong>
                  <span className="muted small">Solicitado el {formatDate(u.createdAt)}</span>
                </div>
                <div>
                  <span className="muted small">Pantallas que podrá ver</span>
                  <PermissionChecks
                    value={drafts[u.id] || []}
                    onChange={(permissions) => setDrafts((prev) => ({ ...prev, [u.id]: permissions }))}
                    disabled={busyId === u.id}
                  />
                </div>
                <div className="actions">
                  <button className="accent" onClick={() => approve(u)} disabled={busyId === u.id}>
                    <UserCheck size={16} aria-hidden="true" />
                    Aprobar
                  </button>
                  <button className="danger" onClick={() => reject(u)} disabled={busyId === u.id}>
                    <UserX size={16} aria-hidden="true" />
                    Rechazar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h3>
          <Users size={20} aria-hidden="true" />
          Usuarios registrados
        </h3>
        {loading ? (
          <Loading />
        ) : registered.length === 0 ? (
          <Empty icon={Users}>Aún no hay usuarios registrados.</Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Registro</th>
                  <th>Estado</th>
                  <th>Permisos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {registered.map((u) => {
                  const isAdmin = u.role === 'ADMIN';
                  return (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.email}</strong> {isAdmin && <span className="tag">Admin</span>}
                      </td>
                      <td className="nowrap">{formatDate(u.createdAt)}</td>
                      <td>
                        <StatusPill status={u.status} kind="user" />
                      </td>
                      <td>
                        {isAdmin ? (
                          <span className="muted">Acceso total</span>
                        ) : (
                          <PermissionChecks
                            value={u.permissions}
                            disabled={busyId === u.id || u.status !== 'APPROVED'}
                            onChange={(permissions) =>
                              review(u, { permissions }, `Permisos de ${u.email} actualizados`)
                            }
                          />
                        )}
                      </td>
                      <td className="actions">
                        {!isAdmin &&
                          (u.status === 'APPROVED' ? (
                            <button className="danger" onClick={() => reject(u)} disabled={busyId === u.id}>
                              <UserX size={16} aria-hidden="true" />
                              Revocar acceso
                            </button>
                          ) : (
                            <button
                              className="secondary"
                              onClick={() => review(u, { status: 'APPROVED' }, `${u.email} reactivado`)}
                              disabled={busyId === u.id}
                            >
                              <RotateCcw size={16} aria-hidden="true" />
                              Reactivar
                            </button>
                          ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
