const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { authorize } = require('../middlewares/auth');
const { ROLES } = require('../../../../domain/entities/User');

module.exports = function createProductRouter({ productController, authenticate }) {
  const router = Router();
  const adminOnly = [authenticate, authorize(ROLES.ADMIN)];

  router.get('/', asyncHandler(productController.list));
  router.get('/:id', asyncHandler(productController.get));
  router.post('/', adminOnly, asyncHandler(productController.create));
  router.put('/:id', adminOnly, asyncHandler(productController.update));
  router.delete('/:id', adminOnly, asyncHandler(productController.remove));

  return router;
};
