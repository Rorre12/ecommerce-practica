require('dotenv').config();

// Raíz de composición: aquí se conectan puertos con adaptadores concretos.
const prisma = require('./infrastructure/adapters/db/prismaClient');
const PrismaUserRepository = require('./infrastructure/adapters/db/PrismaUserRepository');
const PrismaProductRepository = require('./infrastructure/adapters/db/PrismaProductRepository');
const PrismaOrderRepository = require('./infrastructure/adapters/db/PrismaOrderRepository');
const BcryptPasswordHasher = require('./infrastructure/adapters/security/BcryptPasswordHasher');
const JwtTokenService = require('./infrastructure/adapters/security/JwtTokenService');
const NodemailerEmailAdapter = require('./infrastructure/adapters/email/NodemailerEmailAdapter');
const AuthUseCase = require('./application/AuthUseCase');
const ProductUseCase = require('./application/ProductUseCase');
const OrderUseCase = require('./application/OrderUseCase');
const UserUseCase = require('./application/UserUseCase');
const createApp = require('./infrastructure/adapters/http/app');

const PORT = Number(process.env.PORT) || 4000;

const userRepository = new PrismaUserRepository(prisma);
const productRepository = new PrismaProductRepository(prisma);
const orderRepository = new PrismaOrderRepository(prisma);
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '8h',
});

async function main() {
  const emailService = await NodemailerEmailAdapter.fromEnv(process.env);
  const paymentAccount = {
    bank: process.env.PAYMENT_BANK || 'BBVA México',
    accountHolder: process.env.PAYMENT_ACCOUNT_HOLDER || 'Materiales El Constructor S.A. de C.V.',
    accountNumber: process.env.PAYMENT_ACCOUNT_NUMBER || '0123456789',
    clabe: process.env.PAYMENT_CLABE || '012100001234567891',
    deadlineHours: Number(process.env.PAYMENT_DEADLINE_HOURS) || 48,
  };

  const app = createApp({
    authUseCase: new AuthUseCase({ userRepository, passwordHasher, tokenService }),
    productUseCase: new ProductUseCase({ productRepository }),
    orderUseCase: new OrderUseCase({ orderRepository, productRepository, emailService, paymentAccount }),
    userUseCase: new UserUseCase({ userRepository }),
    tokenService,
    corsOrigin: process.env.CORS_ORIGIN || '*',
  });

  const server = app.listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} recibido, cerrando servidor...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('No se pudo iniciar la API:', err);
  process.exit(1);
});
