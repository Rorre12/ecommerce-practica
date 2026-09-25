require('dotenv').config();

const prisma = require('../src/infrastructure/adapters/db/prismaClient');
const BcryptPasswordHasher = require('../src/infrastructure/adapters/security/BcryptPasswordHasher');
const { User, ROLES, USER_STATUS } = require('../src/domain/entities/User');

const SAMPLE_PRODUCTS = [
  { category: 'Cementos y morteros', name: 'Cemento gris 50 kg', unit: 'saco', price: 9.5, stock: 200 },
  { category: 'Cementos y morteros', name: 'Mortero para pegar block 25 kg', unit: 'saco', price: 6.8, stock: 120 },
  { category: 'Cementos y morteros', name: 'Cal hidratada 25 kg', unit: 'saco', price: 4.2, stock: 90 },
  { category: 'Agregados', name: 'Arena de río', unit: 'm³', price: 28.0, stock: 40 },
  { category: 'Agregados', name: 'Grava 3/4"', unit: 'm³', price: 32.0, stock: 35 },
  { category: 'Acero', name: 'Varilla corrugada 3/8" x 12 m', unit: 'varilla', price: 7.9, stock: 500 },
  { category: 'Acero', name: 'Varilla corrugada 1/2" x 12 m', unit: 'varilla', price: 13.4, stock: 300 },
  { category: 'Acero', name: 'Alambre recocido', unit: 'kg', price: 2.1, stock: 150 },
  { category: 'Mampostería', name: 'Block de concreto 15x20x40', unit: 'pieza', price: 0.95, stock: 3000 },
  { category: 'Mampostería', name: 'Ladrillo rojo recocido', unit: 'pieza', price: 0.35, stock: 5000 },
  { category: 'Plomería', name: 'Tubo PVC sanitario 4" x 6 m', unit: 'tramo', price: 11.5, stock: 80 },
  { category: 'Herramientas', name: 'Carretilla 90 L', unit: 'pieza', price: 64.0, stock: 12 },
];

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@tienda.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';

  const admin = await User.create({ email, password, role: ROLES.ADMIN }, new BcryptPasswordHasher());
  await prisma.user.upsert({
    where: { email: admin.email },
    update: { role: ROLES.ADMIN, status: USER_STATUS.APPROVED },
    create: { email: admin.email, password: admin.password, role: ROLES.ADMIN, status: USER_STATUS.APPROVED },
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
