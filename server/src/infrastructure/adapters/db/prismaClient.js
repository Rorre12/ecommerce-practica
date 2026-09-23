const { PrismaClient } = require('@prisma/client');

// Instancia única compartida por todos los repositorios
const prisma = new PrismaClient();

module.exports = prisma;
