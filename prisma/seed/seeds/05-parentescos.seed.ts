import { PrismaClient } from '@prisma/client';

export async function seedParentescos(prisma: PrismaClient) {
  console.log('🔹 Seeding: Parentescos...');

  const parentescos = [
    'Padre',
    'Madre',
    'Abuelo/a',
    'Tío/a',
    'Hermano/a',
    'Tutor legal',
    'Responsable de transporte',
    'Contacto de emergencia',
  ];

  for (const nombre of parentescos) {
    await prisma.parentesco.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  console.log('✅ Parentescos OK');
}
