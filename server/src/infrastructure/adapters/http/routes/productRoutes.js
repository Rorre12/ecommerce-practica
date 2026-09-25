const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { requirePermission } = require('../middlewares/auth');
const { PERMISSIONS } = require('../../../../domain/entities/User');

module.exports = function createProductRouter({ productController, authenticate }) {
  const router = Router();
  const canManage = [authenticate, requirePermission(PERMISSIONS.PRODUCTS)];

  router.get('/', asyncHandler(productController.list));
  router.get('/:id', asyncHandler(productController.get));
  router.post('/', canManage, asyncHandler(productController.create));
  router.put('/:id', canManage, asyncHandler(productController.update));
  router.delete('/:id', canManage, asyncHandler(productController.remove));

  return router;
};
