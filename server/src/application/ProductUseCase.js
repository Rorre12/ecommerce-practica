const { Product } = require('../domain/entities/Product');
const { NotFoundError } = require('../domain/errors');

class ProductUseCase {
  /** @param {{productRepository: import('../domain/ports/ProductRepository')}} deps */
  constructor({ productRepository }) {
    this.productRepository = productRepository;
  }

  list() {
    return this.productRepository.findAll();
  }

  async getById(id) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundError(`Producto ${id} no encontrado`);
    return product;
  }

  create({ name, price, stock }) {
    const product = Product.create({ name, price, stock });
    return this.productRepository.create(product);
  }

  async update(id, changes) {
    const existing = await this.getById(id);
    const updated = existing.update(changes);
    return this.productRepository.update(updated);
  }

  async delete(id) {
    await this.getById(id);
    await this.productRepository.delete(id);
  }
}

module.exports = ProductUseCase;
