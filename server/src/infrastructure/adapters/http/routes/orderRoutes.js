const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');

module.exports = function createOrderRouter({ orderController, authenticate }) {
  const router = Router();

  router.use(authenticate);
  router.post('/', asyncHandler(orderController.create));
  router.get('/', asyncHandler(orderController.list));
  router.get('/:id', asyncHandler(orderController.get));

  return router;
};
