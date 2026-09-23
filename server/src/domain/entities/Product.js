const { ValidationError, InsufficientStockError } = require('../errors');

const MAX_NAME_LENGTH = 120;
const MAX_PRICE = 99999999.99;

class Product {
  constructor({ id, name, price, stock }) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.stock = stock;
  }

  static validate({ name, price, stock }) {
    const errors = [];
    if (typeof name !== 'string' || !name.trim() || name.trim().length > MAX_NAME_LENGTH) {
      errors.push(`El nombre es obligatorio (máx. ${MAX_NAME_LENGTH} caracteres)`);
    }
    if (typeof price !== 'number' || !Number.isFinite(price) || price < 0 || price > MAX_PRICE) {
      errors.push('El precio debe ser un número mayor o igual a 0');
    }
    if (!Number.isInteger(stock) || stock < 0) {
      errors.push('El stock debe ser un entero mayor o igual a 0');
    }
    if (errors.length) throw new ValidationError(errors.join('. '), errors);
  }

  static create({ name, price, stock }) {
    Product.validate({ name, price, stock });
    return new Product({ name: name.trim(), price: Math.round(price * 100) / 100, stock });
  }

  /** Devuelve un nuevo Product con los cambios aplicados y validados. */
  update(changes) {
    const next = {
      name: changes.name !== undefined ? changes.name : this.name,
      price: changes.price !== undefined ? changes.price : this.price,
      stock: changes.stock !== undefined ? changes.stock : this.stock,
    };
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
