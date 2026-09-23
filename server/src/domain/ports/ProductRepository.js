/**
 * Puerto de salida: persistencia de productos.
 */
class ProductRepository {
  /** @returns {Promise<import('../entities/Product').Product[]>} */
  async findAll() {
    throw new Error('ProductRepository.findAll no implementado');
  }

  /** @returns {Promise<import('../entities/Product').Product|null>} */
  async findById(_id) {
    throw new Error('ProductRepository.findById no implementado');
  }

  /** @returns {Promise<import('../entities/Product').Product[]>} */
  async findByIds(_ids) {
    throw new Error('ProductRepository.findByIds no implementado');
  }

  /** @returns {Promise<import('../entities/Product').Product>} */
  async create(_product) {
    throw new Error('ProductRepository.create no implementado');
  }

  /** @returns {Promise<import('../entities/Product').Product>} */
  async update(_product) {
    throw new Error('ProductRepository.update no implementado');
  }

  /** @returns {Promise<void>} */
  async delete(_id) {
    throw new Error('ProductRepository.delete no implementado');
  }
}

module.exports = ProductRepository;
