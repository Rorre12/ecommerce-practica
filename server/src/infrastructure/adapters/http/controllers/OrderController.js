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

  /** ?scope=all devuelve todos los pedidos (requiere permiso ORDERS); por defecto, los propios. */
  list = async (req, res) => {
    const scope = req.query.scope === 'all' ? 'all' : 'mine';
    res.json(await this.orderUseCase.list(req.user, scope));
  };

  get = async (req, res) => {
    res.json(await this.orderUseCase.getById(req.user, parseId(req.params.id)));
  };

  changeStatus = async (req, res) => {
    res.json(await this.orderUseCase.changeStatus(parseId(req.params.id), req.body?.status));
  };
}

module.exports = OrderController;
