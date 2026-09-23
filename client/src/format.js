const currency = new Intl.NumberFormat('es', { style: 'currency', currency: 'USD' });
const dateTime = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' });

export const formatMoney = (value) => currency.format(Number(value) || 0);
export const formatDate = (value) => dateTime.format(new Date(value));
