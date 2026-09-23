class AuthController {
  /** @param {import('../../../../application/AuthUseCase')} authUseCase */
  constructor(authUseCase) {
    this.authUseCase = authUseCase;
  }

  register = async (req, res) => {
    const { email, password } = req.body || {};
    res.status(201).json(await this.authUseCase.register({ email, password }));
  };

  login = async (req, res) => {
    const { email, password } = req.body || {};
    res.json(await this.authUseCase.login({ email, password }));
  };

  me = async (req, res) => {
    res.json(await this.authUseCase.me(req.user.id));
  };
}

module.exports = AuthController;
