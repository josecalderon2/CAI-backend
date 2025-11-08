import { PrismaClient } from '@prisma/client';

export async function seedGradosAcademicos(prisma: PrismaClient) {
  console.log('🔹 Seeding: Grados Académicos...');

  const grados = [
    { nombre: 'Primera Infancia', nota_minima: 7.0, nivel_educativo: 'BASICA' },
    { nombre: 'Primaria', nota_minima: 7.0, nivel_educativo: 'BASICA' },
    { nombre: 'Secundaria', nota_minima: 7.0, nivel_educativo: 'BASICA' },
    {
      nombre: 'Bachillerato',
      nota_minima: 7.0,
      nivel_educativo: 'BACHILLERATO',
    },
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
          nivel_educativo: grado.nivel_educativo as any,
        },
      });
    } else {
      // Actualizar el nivel_educativo si ya existe
      await prisma.grado_Academico.update({
        where: { id_grado_academico: exists.id_grado_academico },
        data: {
          nivel_educativo: grado.nivel_educativo as any,
        },
      });
    }
  }

  console.log(
    '✅ Grados Académicos OK:',
    grados.map((g) => `${g.nombre} (${g.nivel_educativo})`).join(', '),
  );
}
