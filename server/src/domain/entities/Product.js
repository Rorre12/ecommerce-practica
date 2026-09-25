const { ValidationError, InsufficientStockError } = require('../errors');

const MAX_NAME_LENGTH = 120;
const MAX_UNIT_LENGTH = 20;
const MAX_CATEGORY_LENGTH = 60;
const MAX_PRICE = 99999999.99;
const DEFAULT_UNIT = 'unidad';
const DEFAULT_CATEGORY = 'General';

const isText = (value, max) => typeof value === 'string' && value.trim() && value.trim().length <= max;

class Product {
  constructor({ id, name, price, stock, unit = DEFAULT_UNIT, category = DEFAULT_CATEGORY }) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.stock = stock;
    this.unit = unit; // unidad de venta: saco, varilla, m³, pieza...
    this.category = category;
  }

  static validate({ name, price, stock, unit, category }) {
    const errors = [];
    if (!isText(name, MAX_NAME_LENGTH)) {
      errors.push(`El nombre es obligatorio (máx. ${MAX_NAME_LENGTH} caracteres)`);
    }
    if (typeof price !== 'number' || !Number.isFinite(price) || price < 0 || price > MAX_PRICE) {
      errors.push('El precio debe ser un número mayor o igual a 0');
    }
    if (!Number.isInteger(stock) || stock < 0) {
      errors.push('El stock debe ser un entero mayor o igual a 0');
    }
    if (!isText(unit, MAX_UNIT_LENGTH)) {
      errors.push(`La unidad es obligatoria (máx. ${MAX_UNIT_LENGTH} caracteres)`);
    }
    if (!isText(category, MAX_CATEGORY_LENGTH)) {
      errors.push(`La categoría es obligatoria (máx. ${MAX_CATEGORY_LENGTH} caracteres)`);
    }
    if (errors.length) throw new ValidationError(errors.join('. '), errors);
  }

  static create({ name, price, stock, unit = DEFAULT_UNIT, category = DEFAULT_CATEGORY }) {
    Product.validate({ name, price, stock, unit, category });
    return new Product({
      name: name.trim(),
      price: Math.round(price * 100) / 100,
      stock,
      unit: unit.trim(),
      category: category.trim(),
    });
  }

  /** Devuelve un nuevo Product con los cambios aplicados y validados. */
  update(changes) {
    const next = {};
    for (const key of ['name', 'price', 'stock', 'unit', 'category']) {
      next[key] = changes[key] !== undefined ? changes[key] : this[key];
    }
    const product = Product.create(next);
    product.id = this.id;
    return product;
  }

  hasStock(quantity) {
    return this.stock >= quantity;
  }

  /** Regla de negocio: no se puede ordenar más de lo disponible. */
  assertStock(quantity) {
    if (!this.hasStock(quantity)) {
      throw new InsufficientStockError(
        `Stock insuficiente para "${this.name}": disponible ${this.stock}, solicitado ${quantity}`,
        { productId: this.id, available: this.stock, requested: quantity },
      );
    }
  }
}

module.exports = { Product };
