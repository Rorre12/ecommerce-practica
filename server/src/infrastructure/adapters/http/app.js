const express = require('express');
const cors = require('cors');

const AuthController = require('./controllers/AuthController');
const ProductController = require('./controllers/ProductController');
const OrderController = require('./controllers/OrderController');
const UserController = require('./controllers/UserController');
const createAuthRouter = require('./routes/authRoutes');
const createProductRouter = require('./routes/productRoutes');
const createOrderRouter = require('./routes/orderRoutes');
const createUserRouter = require('./routes/userRoutes');
const { authenticate } = require('./middlewares/auth');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

/**
 * Adaptador HTTP primario: expone los casos de uso como API REST.
 * @param {{
 *   authUseCase: import('../../../application/AuthUseCase'),
 *   productUseCase: import('../../../application/ProductUseCase'),
 *   orderUseCase: import('../../../application/OrderUseCase'),
 *   userUseCase: import('../../../application/UserUseCase'),
 *   tokenService: import('../../../domain/ports/TokenService'),
 *   corsOrigin?: string,
 * }} deps
 */
function createApp({ authUseCase, productUseCase, orderUseCase, userUseCase, tokenService, corsOrigin = '*' }) {
  const app = express();

  const origins = corsOrigin.split(',').map((o) => o.trim());
  app.use(cors({ origin: origins.includes('*') ? true : origins }));
  app.use(express.json({ limit: '100kb' }));
  app.disable('x-powered-by');

  const requireAuth = authenticate(tokenService, authUseCase);

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', createAuthRouter({ authController: new AuthController(authUseCase), authenticate: requireAuth }));
  app.use(
    '/api/products',
    createProductRouter({ productController: new ProductController(productUseCase), authenticate: requireAuth }),
  );
  app.use('/api/orders', createOrderRouter({ orderController: new OrderController(orderUseCase), authenticate: requireAuth }));
  app.use('/api/users', createUserRouter({ userController: new UserController(userUseCase), authenticate: requireAuth }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
