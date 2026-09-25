import {
  Ban,
  BrickWall,
  CircleAlert,
  CircleCheck,
  Clock,
  Droplet,
  Info,
  Layers,
  LoaderCircle,
  Mountain,
  Package,
  PackageCheck,
  Ruler,
  ShieldCheck,
  Truck,
  UserX,
  Wrench,
} from 'lucide-react';
import { ORDER_STATUS_LABELS, USER_STATUS_LABELS } from '../format.js';

/** Marca propia: bloques apilados. Usa los tokens para adaptarse al modo oscuro. */
export function BrandMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="7" fill="var(--accent)" />
      <g fill="var(--on-accent)">
        <rect x="6" y="19" width="9" height="6" rx="1" />
        <rect x="17" y="19" width="9" height="6" rx="1" />
        <rect x="11" y="11" width="10" height="6" rx="1" />
        <rect x="14" y="5" width="4" height="4" rx="1" />
      </g>
    </svg>
  );
}

export function PageHeader({ title, description, children }) {
  return (
    <header className="page-head">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children}
    </header>
  );
}

const ALERT_ICONS = { error: CircleAlert, success: CircleCheck, info: Info };

/** Mensaje en línea. Los errores se anuncian de inmediato a lectores de pantalla. */
export function Alert({ type = 'info', children }) {
  if (!children) return null;
  const Icon = ALERT_ICONS[type];
  return (
    <div className={`alert ${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon size={18} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export function Loading({ children = 'Cargando…' }) {
  return (
    <p className="loading" role="status">
      <LoaderCircle size={20} className="spin" aria-hidden="true" />
      {children}
    </p>
  );
}

export function Empty({ icon: Icon = Package, children }) {
  return (
    <p className="empty">
      <Icon size={20} aria-hidden="true" />
      {children}
    </p>
  );
}

const ORDER_ICONS = { PENDING: Clock, CONFIRMED: CircleCheck, SHIPPED: Truck, DELIVERED: PackageCheck, CANCELLED: Ban };
const USER_ICONS = { PENDING: Clock, APPROVED: ShieldCheck, REJECTED: UserX };

/** Estado con icono + texto: nunca se comunica solo con color. */
export function StatusPill({ status, kind = 'order' }) {
  const Icon = (kind === 'order' ? ORDER_ICONS : USER_ICONS)[status] || Clock;
  const label = (kind === 'order' ? ORDER_STATUS_LABELS : USER_STATUS_LABELS)[status] || status;
  return (
    <span className={`status status-${status.toLowerCase()}`}>
      <Icon size={14} aria-hidden="true" />
      {label}
    </span>
  );
}

const CATEGORY_ICONS = [
  [/cement|mortero|cal/i, Layers],
  [/agregad|arena|grava/i, Mountain],
  [/acero|varilla|alambre/i, Ruler],
  [/mampost|block|ladrillo/i, BrickWall],
  [/plomer|tubo/i, Droplet],
  [/herramient/i, Wrench],
];

export function CategoryIcon({ category, size = 14 }) {
  const Icon = CATEGORY_ICONS.find(([re]) => re.test(category))?.[1] || Package;
  return <Icon size={size} aria-hidden="true" />;
}
