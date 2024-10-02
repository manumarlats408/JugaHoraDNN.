import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Crear un nuevo usuario
  const newUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Juan',
      lastName: 'Perez',
    },
  });

  console.log(newUser);
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
