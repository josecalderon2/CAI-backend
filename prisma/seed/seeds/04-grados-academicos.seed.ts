import { PrismaClient } from '@prisma/client';

export async function seedGradosAcademicos(prisma: PrismaClient) {
  console.log('🔹 Seeding: Grados Académicos...');

  const grados = [
    { nombre: 'Primera Infancia', nota_minima: 7.0 },
    { nombre: 'Primaria', nota_minima: 7.0 },
    { nombre: 'Secundaria', nota_minima: 7.0 },
    { nombre: 'Bachillerato', nota_minima: 7.0 },
  ];

  const jornada = await prisma.jornada.findFirst({
    where: { nombre: 'Diurna' },
  });

  if (!jornada) {
    throw new Error(
      'Jornada "Diurna" no encontrada. Ejecuta seedJornadas() primero.',
    );
  }

  for (const grado of grados) {
    const exists = await prisma.grado_Academico.findFirst({
      where: { nombre: grado.nombre },
    });

    if (!exists) {
      await prisma.grado_Academico.create({
        data: {
          nombre: grado.nombre,
          nota_minima: grado.nota_minima,
          id_jornada: jornada.id_jornada,
        },
      });
    }
  }

  console.log(
    '✅ Grados Académicos OK:',
    grados.map((g) => g.nombre).join(', '),
  );
}
