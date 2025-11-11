import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para ingresar notas de ejemplo para Bachillerato
 *
 * Siguiendo el sistema de 4 periodos con 6 rubros cada uno:
 * - Tarea (5%)
 * - Laboratorio (10%)
 * - Actividad Integradora (25%)
 * - Coevaluación (5%)
 * - Examen Parcial (25%)
 * - Examen de Periodo (30%)
 *
 * Fórmula del periodo:
 * Periodo = 0.05*Tarea + 0.10*Lab + 0.25*ActInteg + 0.05*Coeval + 0.25*ExParcial + 0.30*ExPeriodo
 *
 * Promedio Final = (P1 + P2 + P3 + P4) / 4
 */

async function ingresarNotasEjemploBachillerato() {
  try {
    console.log('=== INGRESANDO NOTAS DE EJEMPLO PARA BACHILLERATO ===\n');

    // 1. Buscar el alumno Carlos Martínez
    const alumno = await prisma.alumno.findFirst({
      where: {
        nombre: 'Carlos',
        apellido: 'Martínez',
      },
    });

    if (!alumno) {
      console.log(' No se encontró el alumno Carlos Martínez');
      return;
    }

    console.log(
      `👤 Alumno: ${alumno.nombre} ${alumno.apellido} (ID: ${alumno.id_alumno})\n`,
    );

    // 2. Buscar la asignatura Matemáticas del curso de Bachillerato
    const asignatura = await prisma.asignatura.findFirst({
      where: {
        nombre: 'Matemáticas',
        curso: {
          nombre: 'Primer Año de Bachillerato',
        },
      },
    });

    if (!asignatura) {
      console.log(' No se encontró la asignatura Matemáticas');
      return;
    }

    console.log(
      `📖 Asignatura: ${asignatura.nombre} (ID: ${asignatura.id_asignatura})\n`,
    );

    // 3. Buscar todas las evaluaciones de la asignatura para 2025
    const evaluaciones = await prisma.evaluacion.findMany({
      where: {
        id_asignatura: asignatura.id_asignatura,
        anio_academico: '2025',
      },
      include: {
        tipoEvaluacion: true,
      },
      orderBy: [{ periodo: 'asc' }],
    });

    console.log(` Se encontraron ${evaluaciones.length} evaluaciones\n`);

    // 4. Limpiar notas existentes del alumno en esta asignatura
    const notasEliminadas = await prisma.notas.deleteMany({
      where: {
        id_alumno: alumno.id_alumno,
        id_asignatura: asignatura.id_asignatura,
      },
    });

    console.log(`  Notas eliminadas: ${notasEliminadas.count}\n`);

    // 5. Definir las notas de ejemplo según el documento oficial
    // Ejemplo del documento: Periodo 1 = 82.80
    // ActInteg=90 (22.50), Tareas=87 (4.35), Coev=88 (4.40), Lab=88 (8.80),
    // ExParcial=75 (18.75), ExPeriodo=80 (24.00)
    // Fórmula: 0.25·ActInteg + 0.05·Tareas + 0.05·Coev + 0.10·Lab + 0.25·ExParcial + 0.30·ExPeriodo
    // Cálculo: 0.25*9.0 + 0.05*8.7 + 0.05*8.8 + 0.10*8.8 + 0.25*7.5 + 0.30*8.0 = 8.28

    const notasPorPeriodo = {
      1: {
        // Periodo 1 - Ejemplo del documento (promedio = 8.28)
        'Actividad Integradora': 9.0, // 90 en escala 0-100 = 9.0 en escala 0-10
        Tarea: 8.7, // 87 en escala 0-100 = 8.7 en escala 0-10
        Coevaluación: 8.8, // 88 en escala 0-100 = 8.8 en escala 0-10
        Laboratorio: 8.8, // 88 en escala 0-100 = 8.8 en escala 0-10
        'Examen Parcial': 7.5, // 75 en escala 0-100 = 7.5 en escala 0-10
        'Examen de Periodo': 8.0, // 80 en escala 0-100 = 8.0 en escala 0-10
        // Verificación: 0.25*9.0 + 0.05*8.7 + 0.05*8.8 + 0.10*8.8 + 0.25*7.5 + 0.30*8.0
        //             = 2.25 + 0.435 + 0.44 + 0.88 + 1.875 + 2.40 = 8.28 ✓
      },
      2: {
        // Periodo 2 - Mismo patrón del ejemplo
        'Actividad Integradora': 9.0,
        Tarea: 8.7,
        Coevaluación: 8.8,
        Laboratorio: 8.8,
        'Examen Parcial': 7.5,
        'Examen de Periodo': 8.0,
        // Promedio: 8.28
      },
      3: {
        // Periodo 3 - Mismo patrón del ejemplo
        'Actividad Integradora': 9.0,
        Tarea: 8.7,
        Coevaluación: 8.8,
        Laboratorio: 8.8,
        'Examen Parcial': 7.5,
        'Examen de Periodo': 8.0,
        // Promedio: 8.28
      },
      4: {
        // Periodo 4 - Mismo patrón del ejemplo
        'Actividad Integradora': 9.0,
        Tarea: 8.7,
        Coevaluación: 8.8,
        Laboratorio: 8.8,
        'Examen Parcial': 7.5,
        'Examen de Periodo': 8.0,
        // Promedio: 8.28
      },
    };

    // Promedio esperado final: (8.28 + 8.28 + 8.28 + 8.28) / 4 = 8.28

    console.log(' Ingresando notas por periodo:\n');

    let notasIngresadas = 0;

    // 6. Ingresar las notas
    for (const evaluacion of evaluaciones) {
      const periodo = evaluacion.periodo;
      if (!periodo) continue;

      const tipoNombre = evaluacion.tipoEvaluacion.nombre;
      const notasDelPeriodo =
        notasPorPeriodo[periodo as keyof typeof notasPorPeriodo];

      if (!notasDelPeriodo) continue;

      const calificacion =
        notasDelPeriodo[tipoNombre as keyof typeof notasDelPeriodo];

      if (calificacion === undefined) continue;

      // Crear la nota
      await prisma.notas.create({
        data: {
          id_alumno: alumno.id_alumno,
          id_asignatura: asignatura.id_asignatura,
          id_evaluacion: evaluacion.id_evaluacion,
          calificacion: calificacion,
          trimestre: null, // No aplica para Bachillerato
          fecha_registro: new Date(),
        },
      });

      console.log(`   Periodo ${periodo} - ${tipoNombre}: ${calificacion}`);
      notasIngresadas++;
    }

    console.log(`\n Total de notas ingresadas: ${notasIngresadas}`);

    // 7. Mostrar cálculos esperados
    console.log('\n CÁLCULOS ESPERADOS (según documento oficial):');
    console.log(
      '   Fórmula: 0.25·ActInteg + 0.05·Tareas + 0.05·Coev + 0.10·Lab + 0.25·ExParcial + 0.30·ExPeriodo',
    );
    console.log('');
    console.log(
      '   Periodo 1: 0.25*9.0 + 0.05*8.7 + 0.05*8.8 + 0.10*8.8 + 0.25*7.5 + 0.30*8.0 = 8.28',
    );
    console.log(
      '   Periodo 2: 0.25*9.0 + 0.05*8.7 + 0.05*8.8 + 0.10*8.8 + 0.25*7.5 + 0.30*8.0 = 8.28',
    );
    console.log(
      '   Periodo 3: 0.25*9.0 + 0.05*8.7 + 0.05*8.8 + 0.10*8.8 + 0.25*7.5 + 0.30*8.0 = 8.28',
    );
    console.log(
      '   Periodo 4: 0.25*9.0 + 0.05*8.7 + 0.05*8.8 + 0.10*8.8 + 0.25*7.5 + 0.30*8.0 = 8.28',
    );
    console.log(
      '   ─────────────────────────────────────────────────────────────────────',
    );
    console.log(
      '   Promedio Final: (8.28 + 8.28 + 8.28 + 8.28) / 4 = 8.28 (Aprobado)',
    );
    console.log('');
    console.log(' Proceso completado');
    console.log('\ Próximo paso:');
    console.log('   Iniciar el servidor y usar el endpoint:');
    console.log(
      `   POST /promedios/recalcular/${alumno.id_alumno}?anioAcademico=2025`,
    );
  } catch (error) {
    console.error(' Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

ingresarNotasEjemploBachillerato();
