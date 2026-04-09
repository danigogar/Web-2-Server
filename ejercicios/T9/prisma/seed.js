import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Sembrando datos de prueba...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@biblioteca.com' },
    update: {},
    create: {
      email: 'admin@biblioteca.com',
      name: 'Administrador',
      password: await hashPassword('admin123'),
      role: 'ADMIN',
    },
  });

  const librarian = await prisma.user.upsert({
    where: { email: 'bibliotecario@biblioteca.com' },
    update: {},
    create: {
      email: 'bibliotecario@biblioteca.com',
      name: 'Bibliotecario',
      password: await hashPassword('libro123'),
      role: 'LIBRARIAN',
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'ana@ejemplo.com' },
    update: {},
    create: {
      email: 'ana@ejemplo.com',
      name: 'Ana García',
      password: await hashPassword('usuario123'),
      role: 'USER',
    },
  });

  console.log('✅ Usuarios creados');

  await prisma.book.createMany({
    data: [
      { isbn: '978-84-376-0494-7', title: 'Cien años de soledad', author: 'Gabriel García Márquez', genre: 'Realismo mágico', publishedYear: 1967, copies: 3, available: 3 },
      { isbn: '978-84-204-6428-0', title: 'El amor en los tiempos del cólera', author: 'Gabriel García Márquez', genre: 'Novela romántica', publishedYear: 1985, copies: 2, available: 2 },
      { isbn: '978-84-397-2205-9', title: 'Rayuela', author: 'Julio Cortázar', genre: 'Novela experimental', publishedYear: 1963, copies: 1, available: 1 },
      { isbn: '978-84-204-6373-3', title: 'La sombra del viento', author: 'Carlos Ruiz Zafón', genre: 'Misterio', publishedYear: 2001, copies: 4, available: 4 },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Libros creados');
  console.log('🎉 Seed completado');
}

main().catch(console.error).finally(() => prisma.$disconnect());
