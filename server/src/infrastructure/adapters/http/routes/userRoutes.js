const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { authorize } = require('../middlewares/auth');
const { ROLES } = require('../../../../domain/entities/User');

module.exports = function createUserRouter({ userController, authenticate }) {
  const router = Router();

  router.use(authenticate, authorize(ROLES.ADMIN));
  router.get('/', asyncHandler(userController.list));
  router.patch('/:id', asyncHandler(userController.review));

  return router;
};
