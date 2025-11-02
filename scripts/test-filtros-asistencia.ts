import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFiltros() {
  console.log('🧪 Probando filtros de asistencia...\n');

  // 1. Ver datos crudos en la BD
  console.log('📊 Datos actuales en la BD:');
  const todasAsistencias = await prisma.asistencia.findMany({
    take: 5,
    orderBy: { creadoEn: 'desc' },
  });

  todasAsistencias.forEach((a) => {
    console.log(
      `   ID: ${a.id_asistencia}, Alumno: ${a.id_alumno}, Fecha: ${a.fecha}, Estado: ${a.estado}`,
    );
  });

  // 2. Buscar por fecha específica
  console.log('\n🔍 Test 1: Buscar por fecha "2025-10-31"');
  const fechaInicio = new Date('2025-10-31');
  fechaInicio.setHours(0, 0, 0, 0);

  const fechaFin = new Date('2025-10-31');
  fechaFin.setHours(23, 59, 59, 999);

  console.log(
    `   Rango: ${fechaInicio.toISOString()} a ${fechaFin.toISOString()}`,
  );

  const porFecha = await prisma.asistencia.findMany({
    where: {
      fecha: {
        gte: fechaInicio.toISOString(),
        lte: fechaFin.toISOString(),
      },
    },
  });

  console.log(`   ✅ Resultado: ${porFecha.length} asistencias encontradas`);

  // 3. Buscar por curso
  console.log('\n🔍 Test 2: Buscar alumnos del curso 1');
  const alumnos = await prisma.alumnoCurso.findMany({
    where: {
      cursoId: 1,
      estado: 'ACTIVO',
    },
    select: { alumnoId: true },
  });

  console.log(`   Alumnos en curso 1: ${alumnos.length}`);
  const alumnoIds = alumnos.map((a) => a.alumnoId);
  console.log(`   IDs: [${alumnoIds.join(', ')}]`);

  // 4. Buscar asistencias de esos alumnos
  console.log('\n🔍 Test 3: Asistencias de alumnos del curso 1');
  const asistenciasCurso = await prisma.asistencia.findMany({
    where: {
      id_alumno: { in: alumnoIds },
    },
  });

  console.log(
    `   ✅ Resultado: ${asistenciasCurso.length} asistencias encontradas`,
  );

  // 5. Combinar filtros (curso + fecha)
  console.log('\n🔍 Test 4: Curso 1 + Fecha 2025-10-31');
  const combinado = await prisma.asistencia.findMany({
    where: {
      id_alumno: { in: alumnoIds },
      fecha: {
        gte: fechaInicio.toISOString(),
        lte: fechaFin.toISOString(),
      },
    },
    include: {
      alumno: { select: { nombre: true, apellido: true } },
    },
  });

  console.log(`   ✅ Resultado: ${combinado.length} asistencias encontradas`);
  combinado.forEach((a) => {
    console.log(
      `      - ${a.alumno.nombre} ${a.alumno.apellido}: ${a.estado} (${a.fecha})`,
    );
  });

  await prisma.$disconnect();
}

testFiltros().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
