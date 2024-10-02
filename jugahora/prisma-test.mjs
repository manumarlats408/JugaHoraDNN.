import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const plainPassword = 'manucrack'; // La contraseña sin encriptar

  // Encriptar la contraseña usando bcrypt
  const hashedPassword = await bcrypt.hash(plainPassword, 10); // El número 10 es el "salt rounds"

  // Crear un nuevo usuario con la contraseña encriptada
  const newUser = await prisma.user.create({
    data: {
      email: 'manumarlatss@gmail.com',
      password: hashedPassword, // Guardar la contraseña encriptada
      firstName: 'Manuel',
      lastName: 'Marlats',
    },
  });

  console.log(newUser);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
