import { PrismaClient } from '@prisma/client';

export async function seedCargos(prisma: PrismaClient) {
  console.log('🔹 Seeding: Cargos Administrativos...');

  const cargos = ['Admin', 'P.A', 'Orientador'] as const;
  const result: Record<string, number> = {};

  for (const nombre of cargos) {
    // Buscar o crear cargo
    const existing = await prisma.cargo_administrativo.findFirst({
      where: { nombre },
      select: { id_cargo_administrativo: true },
    });

    if (existing) {
      result[`${nombre.toLowerCase().replace('.', '')}Id`] =
        existing.id_cargo_administrativo;
    } else {
      const created = await prisma.cargo_administrativo.create({
        data: { nombre },
        select: { id_cargo_administrativo: true },
      });
      result[`${nombre.toLowerCase().replace('.', '')}Id`] =
        created.id_cargo_administrativo;
    }
  }

  console.log('✅ Cargos OK:', result);
  return {
    adminId: result.adminId,
    paId: result.paId,
    oriId: result.orientadorId,
  };
}
