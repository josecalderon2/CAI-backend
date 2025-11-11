import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 PASO 1: Limpiando tablas de promedios...\n');

  // Limpiar todas las tablas de promedios
  await prisma.promedioMensual.deleteMany({
    where: { anioAcademico: '2025' },
  });
  console.log('    PromedioMensual limpiada');

  await prisma.promedioTrimestral.deleteMany({
    where: { anioAcademico: '2025' },
  });
  console.log('    PromedioTrimestral limpiada');

  await prisma.promedioFinalAsignatura.deleteMany({
    where: { anioAcademico: '2025' },
  });
  console.log('    PromedioFinalAsignatura limpiada');

  await prisma.promedioFinalAlumno.deleteMany({
    where: { anioAcademico: '2025' },
  });
  console.log('    PromedioFinalAlumno limpiada');

  console.log('\n  PASO 2: Limpiando notas del alumno 4...\n');

  const deleted = await prisma.notas.deleteMany({
    where: {
      id_alumno: 4,
      evaluacion: {
        anio_academico: '2025',
      },
    },
  });

  console.log(`    Eliminadas ${deleted.count} notas del alumno 4\n`);

  console.log(' PASO 3: Ingresando notas del ejemplo del documento...\n');
  console.log('═══════════════════════════════════════════════════');
  console.log('Ejemplo del documento (escala 0-100 convertida a 0-10):');
  console.log('  Febrero: 82 → 8.2');
  console.log('  Marzo: 86 → 8.6');
  console.log('  Abril: 90 → 9.0');
  console.log('  Actividad Integradora: 95 → 9.5');
  console.log('  Autoevaluación: 100 → 10.0');
  console.log('  Examen: 80 → 8.0');
  console.log('  Resultado esperado T1: 88.13 → 8.813');
  console.log('═══════════════════════════════════════════════════\n');

  const alumnoId = 4;
  const anioAcademico = '2025';

  // Obtener evaluaciones por tipo
  const evaluaciones = await prisma.evaluacion.findMany({
    where: {
      anio_academico: anioAcademico,
    },
    include: {
      tipoEvaluacion: true,
    },
    orderBy: [{ id_asignatura: 'asc' }, { trimestre: 'asc' }, { mes: 'asc' }],
  });

  console.log(`Total de evaluaciones encontradas: ${evaluaciones.length}\n`);

  // Notas para cada mes (en escala 0-10)
  const notasPorMes = {
    2: 8.2, // Febrero
    3: 8.6, // Marzo
    4: 9.0, // Abril
    5: 8.2, // Mayo
    6: 8.6, // Junio
    7: 9.0, // Julio
    8: 8.2, // Agosto
    9: 8.6, // Septiembre
    10: 9.0, // Octubre
  };

  let contador = 0;

  for (const evaluacion of evaluaciones) {
    let calificacion = 0;

    const tipo = evaluacion.tipoEvaluacion?.nombre || '';
    const mes = evaluacion.mes;

    // Determinar calificación según tipo
    if (mes && notasPorMes[mes]) {
      // Evaluaciones mensuales (Tarea, Revisión, Laboratorio)
      calificacion = notasPorMes[mes];
    } else if (tipo === 'Actividad Integradora') {
      calificacion = 9.5;
    } else if (tipo === 'Autoevaluación') {
      calificacion = 10.0;
    } else if (tipo === 'Examen Trimestral') {
      calificacion = 8.0;
    }

    await prisma.notas.create({
      data: {
        id_alumno: alumnoId,
        id_asignatura: evaluacion.id_asignatura,
        id_evaluacion: evaluacion.id_evaluacion,
        calificacion: calificacion,
        trimestre: evaluacion.trimestre?.toString() || '1',
      },
    });

    contador++;
  }

  console.log(` Total de notas ingresadas: ${contador}`);
  console.log(`   (36 notas × 2 asignaturas = 72 notas)\n`);

  // Mostrar resumen
  console.log(' Resumen de notas por asignatura:\n');

  const asignaturas = await prisma.asignatura.findMany({
    where: { id_curso: 1 },
  });

  for (const asignatura of asignaturas) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(` ${asignatura.nombre}`);
    console.log('='.repeat(60));

    for (let t = 1; t <= 3; t++) {
      const notasTri = await prisma.notas.findMany({
        where: {
          id_alumno: alumnoId,
          id_asignatura: asignatura.id_asignatura,
          evaluacion: {
            anio_academico: anioAcademico,
            trimestre: t,
          },
        },
        include: {
          evaluacion: {
            include: {
              tipoEvaluacion: true,
            },
          },
        },
        orderBy: {
          evaluacion: {
            mes: 'asc',
          },
        },
      });

      console.log(`\n   Trimestre ${t}:`);
      console.log(`  ${'-'.repeat(56)}`);

      // Mostrar notas por mes
      const meses = [
        [2, 3, 4],
        [5, 6, 7],
        [8, 9, 10],
      ];
      const nombresMeses = [
        ['Febrero', 'Marzo', 'Abril'],
        ['Mayo', 'Junio', 'Julio'],
        ['Agosto', 'Septiembre', 'Octubre'],
      ];

      for (let m = 0; m < 3; m++) {
        const mes = meses[t - 1][m];
        const nombreMes = nombresMeses[t - 1][m];
        const notasMes = notasTri.filter((n) => n.evaluacion?.mes === mes);

        if (notasMes.length > 0) {
          console.log(`\n      ${nombreMes}:`);
          notasMes.forEach((n) => {
            console.log(
              `       ${n.evaluacion?.tipoEvaluacion?.nombre.padEnd(25)} ${n.calificacion}`,
            );
          });
        }
      }

      // Evaluaciones trimestrales
      const actInt = notasTri.find(
        (n) => n.evaluacion?.tipoEvaluacion?.nombre === 'Actividad Integradora',
      );
      const autoeval = notasTri.find(
        (n) => n.evaluacion?.tipoEvaluacion?.nombre === 'Autoevaluación',
      );
      const examen = notasTri.find(
        (n) => n.evaluacion?.tipoEvaluacion?.nombre === 'Examen Trimestral',
      );

      console.log(`\n     Evaluaciones Trimestrales:`);
      console.log(
        `       ${'Actividad Integradora'.padEnd(25)} ${actInt?.calificacion || 'N/A'}`,
      );
      console.log(
        `       ${'Autoevaluación'.padEnd(25)} ${autoeval?.calificacion || 'N/A'}`,
      );
      console.log(
        `       ${'Examen Trimestral'.padEnd(25)} ${examen?.calificacion || 'N/A'}`,
      );
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✨ ¡Listo! Ahora puedes ejecutar el recálculo de promedios.');
  console.log('   POST /promedios/recalcular/4?anioAcademico=2025\n');

  await prisma.$disconnect();
}

main();
