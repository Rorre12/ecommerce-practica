const parseId = require('../parseId');

class OrderController {
  /** @param {import('../../../../application/OrderUseCase')} orderUseCase */
  constructor(orderUseCase) {
    this.orderUseCase = orderUseCase;
  }

  create = async (req, res) => {
    const items = req.body?.items;
    res.status(201).json(await this.orderUseCase.create(req.user.id, items));
  };

  list = async (req, res) => {
    res.json(await this.orderUseCase.list(req.user));
  };

  get = async (req, res) => {
    res.json(await this.orderUseCase.getById(req.user, parseId(req.params.id)));
  };
}

module.exports = OrderController;
