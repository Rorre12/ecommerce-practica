const ProductRepository = require('../../../domain/ports/ProductRepository');
const { Product } = require('../../../domain/entities/Product');
const { ConflictError, NotFoundError } = require('../../../domain/errors');

const toProduct = (row) =>
  row
    ? new Product({
        id: row.id,
        name: row.name,
        price: Number(row.price),
        stock: row.stock,
        unit: row.unit,
        category: row.category,
      })
    : null;

const toData = (product) => ({
  name: product.name,
  price: product.price,
  stock: product.stock,
  unit: product.unit,
  category: product.category,
});

class PrismaProductRepository extends ProductRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async findAll() {
    const rows = await this.prisma.product.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
    return rows.map(toProduct);
  }

  async findById(id) {
    return toProduct(await this.prisma.product.findUnique({ where: { id } }));
  }

  async findByIds(ids) {
    const rows = await this.prisma.product.findMany({ where: { id: { in: ids } } });
    return rows.map(toProduct);
  }

  async create(product) {
    const row = await this.prisma.product.create({
      data: toData(product),
    });
    return toProduct(row);
  }

  async update(product) {
    try {
      const row = await this.prisma.product.update({
        where: { id: product.id },
        data: toData(product),
      });
      return toProduct(row);
    } catch (err) {
      if (err.code === 'P2025') throw new NotFoundError(`Producto ${product.id} no encontrado`);
      throw err;
    }
  }

  async delete(id) {
    try {
      await this.prisma.product.delete({ where: { id } });
    } catch (err) {
      if (err.code === 'P2003') {
        throw new ConflictError('No se puede eliminar un producto que ya forma parte de pedidos');
      }
      if (err.code === 'P2025') throw new NotFoundError(`Producto ${id} no encontrado`);
      throw err;
    }
  }
}

module.exports = PrismaProductRepository;
