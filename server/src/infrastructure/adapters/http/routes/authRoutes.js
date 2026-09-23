const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');

module.exports = function createAuthRouter({ authController, authenticate }) {
  const router = Router();

  router.post('/register', asyncHandler(authController.register));
  router.post('/login', asyncHandler(authController.login));
  router.get('/me', authenticate, asyncHandler(authController.me));

  return router;
};
