/**
 * Puerto de salida: persistencia de pedidos.
 */
class OrderRepository {
  /**
   * Persiste el pedido y descuenta el stock de forma atómica.
   * Debe lanzar InsufficientStockError si el stock cambió concurrentemente.
   * @returns {Promise<import('../entities/Order').Order>}
   */
  async create(_order) {
    throw new Error('OrderRepository.create no implementado');
  }

  /** @returns {Promise<import('../entities/Order').Order|null>} */
  async findById(_id) {
    throw new Error('OrderRepository.findById no implementado');
  }

  /** @returns {Promise<import('../entities/Order').Order[]>} */
  async findAll() {
    throw new Error('OrderRepository.findAll no implementado');
  }

  /** @returns {Promise<import('../entities/Order').Order[]>} */
  async findByUserId(_userId) {
    throw new Error('OrderRepository.findByUserId no implementado');
  }

  /**
   * Cambia el estado de forma atómica. Si el nuevo estado es CANCELLED, devuelve el stock.
   * Debe lanzar ConflictError si el pedido cambió de estado concurrentemente.
   * @returns {Promise<import('../entities/Order').Order>}
   */
  async updateStatus(_order, _status) {
    throw new Error('OrderRepository.updateStatus no implementado');
  }
}

module.exports = OrderRepository;
