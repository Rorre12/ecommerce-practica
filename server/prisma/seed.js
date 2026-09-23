require('dotenv').config();

const prisma = require('../src/infrastructure/adapters/db/prismaClient');
const BcryptPasswordHasher = require('../src/infrastructure/adapters/security/BcryptPasswordHasher');
const { User, ROLES } = require('../src/domain/entities/User');

const SAMPLE_PRODUCTS = [
  { name: 'Teclado mecánico', price: 59.9, stock: 25 },
  { name: 'Mouse inalámbrico', price: 19.5, stock: 40 },
  { name: 'Monitor 24"', price: 149.99, stock: 10 },
  { name: 'Audífonos USB', price: 29.0, stock: 15 },
];

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@tienda.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';

  const admin = await User.create({ email, password, role: ROLES.ADMIN }, new BcryptPasswordHasher());
  await prisma.user.upsert({
    where: { email: admin.email },
    update: { role: ROLES.ADMIN },
    create: { email: admin.email, password: admin.password, role: ROLES.ADMIN },
  });
  console.log(`Administrador listo: ${admin.email}`);

  if ((await prisma.product.count()) === 0) {
    await prisma.product.createMany({ data: SAMPLE_PRODUCTS });
    console.log(`${SAMPLE_PRODUCTS.length} productos de ejemplo creados`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
