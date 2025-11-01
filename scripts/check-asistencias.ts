import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAsistencias() {
  console.log('🔍 Verificando datos de asistencia...\n');

  // 1. Contar total de asistencias
  const total = await prisma.asistencia.count();
  console.log(`📊 Total de asistencias: ${total}`);

  // 2. Agrupar por trimestre
  const porTrimestre = await prisma.asistencia.groupBy({
    by: ['trimestre', 'anio_academico'],
    _count: { id_asistencia: true },
  });

  console.log('\n📅 Asistencias por trimestre:');
  porTrimestre.forEach((item) => {
    console.log(
      `   Trimestre ${item.trimestre}, Año ${item.anio_academico}: ${item._count.id_asistencia} registros`,
    );
  });

  // 3. Ver asistencias del trimestre 3 de 2025
  const trimestre3 = await prisma.asistencia.findMany({
    where: {
      trimestre: 3,
      anio_academico: '2025',
    },
    take: 5,
    include: {
      alumno: {
        select: { nombre: true, apellido: true },
      },
    },
  });

  console.log('\n📝 Primeras 5 asistencias del Trimestre 3, 2025:');
  if (trimestre3.length === 0) {
    console.log('   ❌ No hay asistencias para el Trimestre 3 de 2025');
  } else {
    trimestre3.forEach((asistencia) => {
      console.log(
        `   - ${asistencia.alumno.nombre} ${asistencia.alumno.apellido}: ${asistencia.estado} (${asistencia.fecha.toISOString().split('T')[0]})`,
      );
    });
  }

  // 4. Verificar cursos y alumnos
  const cursos = await prisma.curso.count();
  const alumnos = await prisma.alumno.count();
  const alumnosCurso = await prisma.alumnoCurso.count({
    where: { estado: 'ACTIVO' },
  });

  console.log('\n👥 Datos del sistema:');
  console.log(`   Cursos: ${cursos}`);
  console.log(`   Alumnos: ${alumnos}`);
  console.log(`   Inscripciones activas: ${alumnosCurso}`);

  await prisma.$disconnect();
}

checkAsistencias().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
