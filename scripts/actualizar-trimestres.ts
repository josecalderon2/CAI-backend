import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function calcularTrimestre(fecha: Date): number {
  const mes = fecha.getMonth() + 1;
  if (mes >= 1 && mes <= 4) return 1;
  if (mes >= 5 && mes <= 7) return 2;
  if (mes >= 8 && mes <= 10) return 3;
  if (mes >= 11 && mes <= 12) return 4;
  return 1;
}

async function actualizarAsistenciasSinTrimestre() {
  console.log('🔄 Actualizando asistencias sin trimestre...\n');

  // Obtener todas las asistencias sin trimestre
  const asistenciasSinTrimestre = await prisma.asistencia.findMany({
    where: {
      OR: [{ trimestre: null }, { anio_academico: null }],
    },
  });

  console.log(
    `📊 Encontradas ${asistenciasSinTrimestre.length} asistencias sin trimestre/año`,
  );

  let actualizadas = 0;

  for (const asistencia of asistenciasSinTrimestre) {
    const trimestre = calcularTrimestre(asistencia.fecha);
    const anioAcademico = asistencia.fecha.getFullYear().toString();

    await prisma.asistencia.update({
      where: { id_asistencia: asistencia.id_asistencia },
      data: {
        trimestre: trimestre,
        anio_academico: anioAcademico,
      },
    });

    console.log(
      `   ✅ Actualizada asistencia ${asistencia.id_asistencia}: Trimestre ${trimestre}, Año ${anioAcademico} (Fecha: ${asistencia.fecha.toISOString().split('T')[0]})`,
    );
    actualizadas++;
  }

  console.log(`\n✅ Total actualizadas: ${actualizadas}`);

  await prisma.$disconnect();
}

actualizarAsistenciasSinTrimestre().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
