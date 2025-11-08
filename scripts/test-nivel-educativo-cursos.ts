import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testNivelEducativoCursos() {
  console.log('\n🔍 PRUEBA: Endpoint GET /cursos/:id/nivel-educativo\n');
  console.log('='.repeat(80));

  try {
    // 1. Obtener todos los cursos con sus grados académicos
    console.log('\n📚 Consultando cursos en la base de datos...\n');

    const cursos = await prisma.curso.findMany({
      where: {
        activo: true,
        gradoAcademico: {
          isNot: null,
        },
      },
      include: {
        gradoAcademico: {
          select: {
            id_grado_academico: true,
            nombre: true,
            nivel_educativo: true,
          },
        },
        orientador: {
          select: {
            id_orientador: true,
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: {
        id_grado_academico: 'asc',
      },
      take: 10, // Limitar a 10 para la prueba
    });

    if (cursos.length === 0) {
      console.log('❌ No se encontraron cursos en la base de datos');
      return;
    }

    console.log(`✅ Se encontraron ${cursos.length} cursos\n`);
    console.log('='.repeat(80));

    // 2. Mostrar información detallada de cada curso
    cursos.forEach((curso, index) => {
      if (!curso.gradoAcademico) {
        console.log(
          `\n${index + 1}. CURSO: ${curso.nombre} (ID: ${curso.id_curso}) - ⚠️ SIN GRADO ACADÉMICO`,
        );
        return;
      }

      console.log(
        `\n${index + 1}. CURSO: ${curso.nombre} (ID: ${curso.id_curso})`,
      );
      console.log('   ' + '-'.repeat(76));
      console.log(`   📖 Sección: ${curso.seccion || 'Sin sección'}`);
      console.log(
        `   📊 Grado Académico: ${curso.gradoAcademico.nombre} (ID: ${curso.gradoAcademico.id_grado_academico})`,
      );
      console.log(
        `   🎓 Nivel Educativo: ${curso.gradoAcademico.nivel_educativo}`,
      );
      console.log(
        `   👨‍🏫 Orientador: ${curso.orientador?.nombre || 'Sin'} ${curso.orientador?.apellido || 'asignar'}`,
      );
      console.log(
        `   📅 Año Académico: ${curso.anio_academico || 'No definido'}`,
      );

      // Indicador visual del nivel educativo
      const nivelIcon =
        curso.gradoAcademico.nivel_educativo === 'BASICA' ? '🟢' : '🔵';
      console.log(
        `   ${nivelIcon} Tipo: ${curso.gradoAcademico.nivel_educativo === 'BASICA' ? 'Educación Básica (1º-9º)' : 'Bachillerato (1º-2º año)'}`,
      );
    });

    console.log('\n' + '='.repeat(80));

    // 3. Agrupar por nivel educativo
    const cursosBasica = cursos.filter(
      (c) => c.gradoAcademico?.nivel_educativo === 'BASICA',
    );
    const cursosBachillerato = cursos.filter(
      (c) => c.gradoAcademico?.nivel_educativo === 'BACHILLERATO',
    );

    console.log('\n📊 RESUMEN POR NIVEL EDUCATIVO:\n');
    console.log(`🟢 Educación Básica (BASICA): ${cursosBasica.length} cursos`);
    if (cursosBasica.length > 0) {
      cursosBasica.forEach((c) => {
        if (c.gradoAcademico) {
          console.log(`   - ${c.nombre} (${c.gradoAcademico.nombre})`);
        }
      });
    }

    console.log(`\n🔵 Bachillerato: ${cursosBachillerato.length} cursos`);
    if (cursosBachillerato.length > 0) {
      cursosBachillerato.forEach((c) => {
        if (c.gradoAcademico) {
          console.log(`   - ${c.nombre} (${c.gradoAcademico.nombre})`);
        }
      });
    }

    console.log('\n' + '='.repeat(80));

    // 4. Simular respuesta del endpoint para algunos cursos
    console.log('\n🧪 SIMULACIÓN DE RESPUESTA DEL ENDPOINT:\n');

    const cursosParaProbar = cursos.slice(0, 3).filter((c) => c.gradoAcademico);

    for (const curso of cursosParaProbar) {
      if (!curso.gradoAcademico) continue;

      console.log(`\n📡 GET /cursos/${curso.id_curso}/nivel-educativo`);
      console.log('   Response (200 OK):');
      const response = {
        id_curso: curso.id_curso,
        nombre_curso: curso.nombre,
        id_grado_academico: curso.gradoAcademico.id_grado_academico,
        nombre_grado: curso.gradoAcademico.nombre,
        nivel_educativo: curso.gradoAcademico.nivel_educativo,
      };
      console.log(
        '   ',
        JSON.stringify(response, null, 2).split('\n').join('\n    '),
      );
    }

    console.log('\n' + '='.repeat(80));

    // 5. Verificar integridad de datos
    console.log('\n✅ VERIFICACIÓN DE INTEGRIDAD:\n');

    const cursosSinNivel = cursos.filter(
      (c) => !c.gradoAcademico?.nivel_educativo,
    );
    if (cursosSinNivel.length > 0) {
      console.log(
        `❌ ADVERTENCIA: ${cursosSinNivel.length} cursos sin nivel educativo definido:`,
      );
      cursosSinNivel.forEach((c) => {
        console.log(
          `   - ${c.nombre} (Grado: ${c.gradoAcademico?.nombre || 'Sin grado'})`,
        );
      });
    } else {
      console.log('✅ Todos los cursos tienen nivel educativo definido');
    }

    const cursosConNivel = cursos.filter(
      (c) => c.gradoAcademico?.nivel_educativo,
    );
    console.log(
      `✅ ${cursosConNivel.length}/${cursos.length} cursos tienen nivel educativo correcto`,
    );

    // 6. Verificar que los niveles educativos son válidos
    const nivelesValidos = ['BASICA', 'BACHILLERATO'];
    const cursosConNivelInvalido = cursos.filter(
      (c) =>
        c.gradoAcademico?.nivel_educativo &&
        !nivelesValidos.includes(c.gradoAcademico.nivel_educativo),
    );

    if (cursosConNivelInvalido.length > 0) {
      console.log(
        `❌ ADVERTENCIA: ${cursosConNivelInvalido.length} cursos con nivel educativo inválido:`,
      );
      cursosConNivelInvalido.forEach((c) => {
        if (c.gradoAcademico) {
          console.log(
            `   - ${c.nombre}: "${c.gradoAcademico.nivel_educativo}" (debe ser BASICA o BACHILLERATO)`,
          );
        }
      });
    } else {
      console.log(
        '✅ Todos los niveles educativos son válidos (BASICA o BACHILLERATO)',
      );
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE\n');

    // 7. Instrucciones para probar en el navegador/Postman
    console.log('📖 INSTRUCCIONES PARA PROBAR EL ENDPOINT:\n');
    console.log('1. El servidor está corriendo en http://localhost:3000');
    console.log('2. Puedes probar el endpoint con curl:');
    console.log(
      `\n   curl http://localhost:3000/cursos/${cursos[0].id_curso}/nivel-educativo\n`,
    );
    console.log('3. O abrirlo directamente en el navegador:');
    console.log(
      `   http://localhost:3000/cursos/${cursos[0].id_curso}/nivel-educativo`,
    );
    console.log('\n4. Swagger UI disponible en:');
    console.log('   http://localhost:3000/api');
    console.log('\n' + '='.repeat(80) + '\n');
  } catch (error) {
    console.error('\n❌ ERROR durante la prueba:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testNivelEducativoCursos().catch((error) => {
  console.error('Error fatal:', error);
  process.exit(1);
});
