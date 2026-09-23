const parseId = require('../parseId');

const pickProductFields = (body = {}) => {
  const fields = {};
  for (const key of ['name', 'price', 'stock']) {
    if (body[key] !== undefined) fields[key] = body[key];
  }
  return fields;
};

class ProductController {
  /** @param {import('../../../../application/ProductUseCase')} productUseCase */
  constructor(productUseCase) {
    this.productUseCase = productUseCase;
  }

  list = async (_req, res) => {
    res.json(await this.productUseCase.list());
  };

  get = async (req, res) => {
    res.json(await this.productUseCase.getById(parseId(req.params.id)));
  };

  create = async (req, res) => {
    res.status(201).json(await this.productUseCase.create(pickProductFields(req.body)));
  };

  update = async (req, res) => {
    res.json(await this.productUseCase.update(parseId(req.params.id), pickProductFields(req.body)));
  };

  remove = async (req, res) => {
    await this.productUseCase.delete(parseId(req.params.id));
    res.status(204).end();
  };
}

module.exports = ProductController;
