const parseId = require('../parseId');

class UserController {
  /** @param {import('../../../../application/UserUseCase')} userUseCase */
  constructor(userUseCase) {
    this.userUseCase = userUseCase;
  }

  list = async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    res.json(await this.userUseCase.list({ status }));
  };

  review = async (req, res) => {
    const { status, permissions } = req.body || {};
    res.json(await this.userUseCase.review(parseId(req.params.id), { status, permissions }));
  };
}

module.exports = UserController;
