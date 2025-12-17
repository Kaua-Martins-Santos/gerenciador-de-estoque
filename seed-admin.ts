// seed-admin.ts
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10); // Senha padrão: 123456

  const user = await prisma.user.upsert({
    where: { email: 'admin@unasp.br' },
    update: {},
    create: {
      email: 'admin@unasp.br',
      name: 'Administrador',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  console.log({ user });
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });