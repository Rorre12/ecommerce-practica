const currency = new Intl.NumberFormat('es', { style: 'currency', currency: 'USD' });
const dateTime = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' });

export const formatMoney = (value) => currency.format(Number(value) || 0);
export const formatDate = (value) => dateTime.format(new Date(value));

export const ORDER_STATUS_LABELS = {
  PENDING: 'Pendiente de pago',
  CONFIRMED: 'Confirmado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export const USER_STATUS_LABELS = {
  PENDING: 'Pendiente',
  APPROVED: 'Activo',
  REJECTED: 'Sin acceso',
};

/** Pantallas de gestión que el admin puede habilitar a un cliente. */
export const PERMISSION_OPTIONS = [
  { value: 'PRODUCTS', label: 'Productos', hint: 'Ver y modificar el catálogo' },
  { value: 'ORDERS', label: 'Pedidos', hint: 'Ver y gestionar todos los pedidos' },
];

/** Referencia de pago que viaja en el correo; la misma regla que PaymentInstructions en el backend. */
export const paymentReference = (orderId) => `PED-${String(orderId).padStart(6, '0')}`;
