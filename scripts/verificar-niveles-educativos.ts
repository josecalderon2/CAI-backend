import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarGradosYCursos() {
  console.log('🔍 Verificando Grados Académicos y sus Niveles Educativos...\n');

  // Obtener todos los grados académicos
  const grados = await prisma.grado_Academico.findMany({
    orderBy: { id_grado_academico: 'asc' },
  });

  console.log('📚 GRADOS ACADÉMICOS:');
  console.log('═'.repeat(80));
  grados.forEach((grado) => {
    const emoji = grado.nivel_educativo === 'BACHILLERATO' ? '🎓' : '📖';
    console.log(
      `${emoji} ID: ${grado.id_grado_academico} | ${grado.nombre.padEnd(20)} | Nivel: ${grado.nivel_educativo}`,
    );
  });

  console.log('\n🏫 CURSOS Y SUS NIVELES EDUCATIVOS:');
  console.log('═'.repeat(80));

  // Obtener cursos con sus grados académicos
  const cursos = await prisma.curso.findMany({
    where: { activo: true },
    include: {
      gradoAcademico: {
        select: {
          nombre: true,
          nivel_educativo: true,
        },
      },
    },
    orderBy: { id_curso: 'asc' },
  });

  if (cursos.length === 0) {
    console.log('⚠️  No hay cursos activos en la base de datos');
  } else {
    cursos.forEach((curso) => {
      const emoji =
        curso.gradoAcademico?.nivel_educativo === 'BACHILLERATO' ? '🎓' : '📖';
      const nivel = curso.gradoAcademico?.nivel_educativo || 'SIN NIVEL';
      const grado = curso.gradoAcademico?.nombre || 'SIN GRADO';

      console.log(
        `${emoji} Curso ID: ${curso.id_curso} | ${curso.nombre.padEnd(25)} | Grado: ${grado.padEnd(20)} | Nivel: ${nivel}`,
      );
    });
  }

  // Contar por nivel educativo
  console.log('\n📊 RESUMEN:');
  console.log('═'.repeat(80));

  const countBasica = await prisma.grado_Academico.count({
    where: { nivel_educativo: 'BASICA' },
  });

  const countBachillerato = await prisma.grado_Academico.count({
    where: { nivel_educativo: 'BACHILLERATO' },
  });

  console.log(`📖 Grados de BÁSICA: ${countBasica}`);
  console.log(`🎓 Grados de BACHILLERATO: ${countBachillerato}`);

  const cursosBasica = cursos.filter(
    (c) => c.gradoAcademico?.nivel_educativo === 'BASICA',
  ).length;
  const cursosBachillerato = cursos.filter(
    (c) => c.gradoAcademico?.nivel_educativo === 'BACHILLERATO',
  ).length;

  console.log(`📖 Cursos de BÁSICA: ${cursosBasica}`);
  console.log(`🎓 Cursos de BACHILLERATO: ${cursosBachillerato}`);

  console.log('\n✅ Verificación completada');
  await prisma.$disconnect();
}

verificarGradosYCursos().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
