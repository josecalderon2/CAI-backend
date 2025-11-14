/**
 * Script para generar datos completos de prueba para reportes de notas
 *
 * Genera:
 * - Evaluaciones para BÁSICA (Primaria/Secundaria) usando trimestres
 * - Evaluaciones para BACHILLERATO usando periodos
 * - Notas completas para alumnos de ejemplo
 * - Promedios calculados
 * - Asistencias y conductas para boletas completas
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const anioAcademico = '2025';

async function main() {
  console.log('🚀 Iniciando generación de datos de prueba para reportes...\n');

  // 1. Obtener configuración de cursos y grados
  const cursosBasica = await prisma.curso.findMany({
    where: {
      gradoAcademico: {
        nombre: { in: ['Primaria', 'Secundaria'] },
      },
    },
    include: {
      gradoAcademico: true,
      asignaturas: {
        include: {
          orientadores: {
            where: { activo: true },
            include: { orientador: true },
          },
        },
      },
    },
  });

  const cursosBachillerato = await prisma.curso.findMany({
    where: {
      gradoAcademico: {
        nombre: 'Bachillerato',
      },
    },
    include: {
      gradoAcademico: true,
      asignaturas: {
        include: {
          orientadores: {
            where: { activo: true },
            include: { orientador: true },
          },
        },
      },
    },
  });

  console.log(`📚 Cursos BÁSICA encontrados: ${cursosBasica.length}`);
  console.log(
    `🎓 Cursos BACHILLERATO encontrados: ${cursosBachillerato.length}\n`,
  );

  // 2. Generar evaluaciones para BÁSICA (trimestres)
  for (const curso of cursosBasica) {
    console.log(
      `\n📖 Generando evaluaciones para: ${curso.nombre} (${curso.gradoAcademico?.nombre})`,
    );

    const tiposEvaluacion = await prisma.tipo_evaluacion.findMany({
      where: {
        id_grado_academico: curso.id_grado_academico!,
        activo: true,
      },
    });

    for (const asignatura of curso.asignaturas) {
      const orientador = asignatura.orientadores[0]?.orientador;
      if (!orientador) {
        console.log(
          `⚠️  Sin orientador para ${asignatura.nombre}, saltando...`,
        );
        continue;
      }

      console.log(`  ✏️  Asignatura: ${asignatura.nombre}`);

      // Generar evaluaciones por trimestre (1, 2, 3)
      for (let trimestre = 1; trimestre <= 3; trimestre++) {
        const mesesTrimestre = getMesesPorTrimestre(trimestre);

        for (const tipo of tiposEvaluacion) {
          const esMensual = [
            'TAREA',
            'REVISION_CUADERNO',
            'LABORATORIO',
          ].includes(tipo.nombre);

          if (esMensual) {
            // Crear 1 por cada mes del trimestre
            for (const mes of mesesTrimestre) {
              await crearEvaluacionSiNoExiste({
                nombre: `${tipo.nombre} - Mes ${mes} (T${trimestre})`,
                id_tipo_evaluacion: tipo.id_tipo_evaluacion,
                id_asignatura: asignatura.id_asignatura,
                id_orientador: orientador.id_orientador,
                anio_academico: anioAcademico,
                trimestre,
                mes,
                periodo: null,
                puntaje_maximo: 10,
                puntaje_minimo: 0,
              });
            }
          } else {
            // Crear 1 por trimestre (Actividad Integradora, Autoevaluación, Examen Trimestral)
            await crearEvaluacionSiNoExiste({
              nombre: `${tipo.nombre} - Trimestre ${trimestre}`,
              id_tipo_evaluacion: tipo.id_tipo_evaluacion,
              id_asignatura: asignatura.id_asignatura,
              id_orientador: orientador.id_orientador,
              anio_academico: anioAcademico,
              trimestre,
              mes: null,
              periodo: null,
              puntaje_maximo: 10,
              puntaje_minimo: 0,
            });
          }
        }
      }
    }
  }

  // 3. Generar evaluaciones para BACHILLERATO (periodos)
  for (const curso of cursosBachillerato) {
    console.log(
      `\n🎓 Generando evaluaciones para: ${curso.nombre} (${curso.gradoAcademico?.nombre})`,
    );

    const tiposEvaluacion = await prisma.tipo_evaluacion.findMany({
      where: {
        id_grado_academico: curso.id_grado_academico!,
        activo: true,
      },
    });

    for (const asignatura of curso.asignaturas) {
      const orientador = asignatura.orientadores[0]?.orientador;
      if (!orientador) {
        console.log(
          `⚠️  Sin orientador para ${asignatura.nombre}, saltando...`,
        );
        continue;
      }

      console.log(`  ✏️  Asignatura: ${asignatura.nombre}`);

      // Generar evaluaciones por periodo (1, 2, 3, 4)
      for (let periodo = 1; periodo <= 4; periodo++) {
        for (const tipo of tiposEvaluacion) {
          await crearEvaluacionSiNoExiste({
            nombre: `${tipo.nombre} - Periodo ${periodo}`,
            id_tipo_evaluacion: tipo.id_tipo_evaluacion,
            id_asignatura: asignatura.id_asignatura,
            id_orientador: orientador.id_orientador,
            anio_academico: anioAcademico,
            trimestre: null,
            mes: null,
            periodo,
            puntaje_maximo: 10,
            puntaje_minimo: 0,
          });
        }
      }
    }
  }

  // 4. Generar notas de ejemplo para alumnos
  console.log('\n\n📝 Generando notas de ejemplo...\n');

  const alumnosBasica = await prisma.alumno.findMany({
    where: {
      inscripciones: {
        some: {
          curso: {
            gradoAcademico: {
              nombre: { in: ['Primaria', 'Secundaria'] },
            },
          },
          anioAcademico: anioAcademico,
          estado: 'ACTIVO',
        },
      },
    },
    take: 3,
  });

  const alumnosBachillerato = await prisma.alumno.findMany({
    where: {
      inscripciones: {
        some: {
          curso: {
            gradoAcademico: {
              nombre: 'Bachillerato',
            },
          },
          anioAcademico: anioAcademico,
          estado: 'ACTIVO',
        },
      },
    },
    take: 3,
  });

  console.log(`👥 Alumnos BÁSICA: ${alumnosBasica.length}`);
  console.log(`👥 Alumnos BACHILLERATO: ${alumnosBachillerato.length}\n`);

  // Generar notas para alumnos de BÁSICA
  for (const alumno of alumnosBasica) {
    await generarNotasBasica(alumno.id_alumno, anioAcademico);
  }

  // Generar notas para alumnos de BACHILLERATO
  for (const alumno of alumnosBachillerato) {
    await generarNotasBachillerato(alumno.id_alumno, anioAcademico);
  }

  // 5. Generar asistencias y conductas
  console.log('\n\n📊 Generando asistencias y conductas de ejemplo...\n');

  for (const alumno of [...alumnosBasica, ...alumnosBachillerato]) {
    await generarAsistencias(alumno.id_alumno, anioAcademico);
    await generarConductas(alumno.id_alumno, anioAcademico);
  }

  console.log('\n\n✅ Datos de prueba generados exitosamente!');
  console.log('\n📋 Resumen:');
  console.log(`  - Cursos BÁSICA: ${cursosBasica.length}`);
  console.log(`  - Cursos BACHILLERATO: ${cursosBachillerato.length}`);
  console.log(`  - Alumnos BÁSICA con notas: ${alumnosBasica.length}`);
  console.log(
    `  - Alumnos BACHILLERATO con notas: ${alumnosBachillerato.length}`,
  );
  console.log(
    '\n🧪 Usa el documento GUIA-REPORTES-NOTAS.md para probar los endpoints',
  );
}

// ============ FUNCIONES AUXILIARES ============

function getMesesPorTrimestre(trimestre: number): number[] {
  switch (trimestre) {
    case 1:
      return [2, 3, 4]; // Feb, Mar, Abr
    case 2:
      return [5, 6, 7]; // May, Jun, Jul
    case 3:
      return [8, 9, 10]; // Ago, Sep, Oct
    default:
      return [];
  }
}

async function crearEvaluacionSiNoExiste(data: any) {
  const existe = await prisma.evaluacion.findFirst({
    where: {
      nombre: data.nombre,
      id_asignatura: data.id_asignatura,
      anio_academico: data.anio_academico,
    },
  });

  if (!existe) {
    await prisma.evaluacion.create({ data });
    console.log(`    ✓ Creada: ${data.nombre}`);
  }
}

async function generarNotasBasica(alumnoId: number, anio: string) {
  const evaluaciones = await prisma.evaluacion.findMany({
    where: {
      anio_academico: anio,
      asignatura: {
        curso: {
          inscripciones: {
            some: {
              alumnoId: alumnoId,
              anioAcademico: anio,
              estado: 'ACTIVO',
            },
          },
        },
      },
      trimestre: { not: null },
    },
    include: {
      tipoEvaluacion: true,
    },
  });

  for (const evaluacion of evaluaciones) {
    const existe = await prisma.notas.findFirst({
      where: {
        id_alumno: alumnoId,
        id_evaluacion: evaluacion.id_evaluacion,
      },
    });

    if (!existe) {
      // Generar nota aleatoria entre 7.0 y 10.0
      const calificacion = parseFloat((Math.random() * 3 + 7).toFixed(2));

      await prisma.notas.create({
        data: {
          id_alumno: alumnoId,
          id_evaluacion: evaluacion.id_evaluacion,
          id_asignatura: evaluacion.id_asignatura,
          calificacion: calificacion,
          fecha_registro: new Date(),
          trimestre: evaluacion.trimestre?.toString(),
        },
      });
    }
  }

  console.log(`  ✓ Notas generadas para alumno ${alumnoId} (BÁSICA)`);
}

async function generarNotasBachillerato(alumnoId: number, anio: string) {
  const evaluaciones = await prisma.evaluacion.findMany({
    where: {
      anio_academico: anio,
      asignatura: {
        curso: {
          inscripciones: {
            some: {
              alumnoId: alumnoId,
              anioAcademico: anio,
              estado: 'ACTIVO',
            },
          },
        },
      },
      periodo: { not: null },
    },
    include: {
      tipoEvaluacion: true,
    },
  });

  for (const evaluacion of evaluaciones) {
    const existe = await prisma.notas.findFirst({
      where: {
        id_alumno: alumnoId,
        id_evaluacion: evaluacion.id_evaluacion,
      },
    });

    if (!existe) {
      // Generar nota aleatoria entre 7.0 y 10.0
      const calificacion = parseFloat((Math.random() * 3 + 7).toFixed(2));

      await prisma.notas.create({
        data: {
          id_alumno: alumnoId,
          id_evaluacion: evaluacion.id_evaluacion,
          id_asignatura: evaluacion.id_asignatura,
          calificacion: calificacion,
          fecha_registro: new Date(),
        },
      });
    }
  }

  console.log(`  ✓ Notas generadas para alumno ${alumnoId} (BACHILLERATO)`);
}

async function generarAsistencias(alumnoId: number, anio: string) {
  const orientador = await prisma.orientador.findFirst();
  if (!orientador) return;

  // Generar 30 registros de asistencia
  for (let i = 0; i < 30; i++) {
    const fecha = new Date(2025, 1 + (i % 9), 1 + i); // Distribuir en varios meses

    const existe = await prisma.asistencia.findUnique({
      where: {
        id_alumno_fecha: {
          id_alumno: alumnoId,
          fecha: fecha,
        },
      },
    });

    if (!existe) {
      // 90% presente, 5% excusado, 5% sin permiso
      const rand = Math.random();
      let estado: 'P' | 'E' | 'SP' | 'A' = 'P';
      if (rand > 0.95) estado = 'SP';
      else if (rand > 0.9) estado = 'E';

      await prisma.asistencia.create({
        data: {
          id_alumno: alumnoId,
          id_orientador: orientador.id_orientador,
          fecha: fecha,
          estado: estado,
          anio_academico: anio,
          trimestre: Math.ceil((fecha.getMonth() + 1) / 3),
        },
      });
    }
  }

  console.log(`  ✓ Asistencias generadas para alumno ${alumnoId}`);
}

async function generarConductas(alumnoId: number, anio: string) {
  const infracciones = await prisma.infraccionCatalogo.findMany({
    where: { activo: true },
    take: 3,
  });

  if (infracciones.length === 0) return;

  const orientador = await prisma.orientador.findFirst();
  if (!orientador) return;

  // Generar 2-3 infracciones aleatorias
  const numInfracciones = Math.floor(Math.random() * 2) + 1;

  for (let i = 0; i < numInfracciones; i++) {
    const infraccion =
      infracciones[Math.floor(Math.random() * infracciones.length)];
    const fecha = new Date(
      2025,
      Math.floor(Math.random() * 9) + 1,
      Math.floor(Math.random() * 28) + 1,
    );

    await prisma.conducta
      .create({
        data: {
          id_alumno: alumnoId,
          id_infraccion_catalogo: infraccion.id_infraccion,
          fecha: fecha,
          id_orientador: orientador.id_orientador,
          anio_academico: anio,
          trimestre: Math.ceil((fecha.getMonth() + 1) / 3),
          observacion: `Incidente registrado en ${fecha.toLocaleDateString()}`,
        },
      })
      .catch(() => {}); // Ignorar duplicados
  }

  console.log(`  ✓ Conductas generadas para alumno ${alumnoId}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
