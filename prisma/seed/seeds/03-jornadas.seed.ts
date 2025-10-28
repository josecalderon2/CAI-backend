import { PrismaClient } from '@prisma/client';

export async function seedJornadas(prisma: PrismaClient) {
  console.log('🔹 Seeding: Jornadas...');

  const jornadas = ['Diurna'];

  for (const nombre of jornadas) {
    const exists = await prisma.jornada.findFirst({ where: { nombre } });
    if (!exists) {
      await prisma.jornada.create({ data: { nombre } });
    }
  }

  console.log('✅ Jornadas OK:', jornadas);
}
