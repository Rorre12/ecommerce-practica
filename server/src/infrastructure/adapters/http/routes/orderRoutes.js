const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { requirePermission } = require('../middlewares/auth');
const { PERMISSIONS } = require('../../../../domain/entities/User');

module.exports = function createOrderRouter({ orderController, authenticate }) {
  const router = Router();

  router.use(authenticate);
  router.post('/', asyncHandler(orderController.create));
  router.get('/', asyncHandler(orderController.list));
  router.get('/:id', asyncHandler(orderController.get));
  router.patch('/:id/status', requirePermission(PERMISSIONS.ORDERS), asyncHandler(orderController.changeStatus));

  return router;
};
