import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function consultarBachillerato() {
  try {
    console.log('=== CONSULTANDO INFORMACIÓN DE BACHILLERATO ===\n');

    // 1. Buscar grado académico Bachillerato
    const gradoBachillerato = await prisma.grado_Academico.findFirst({
      where: {
        nombre: 'Bachillerato',
      },
    });

    if (!gradoBachillerato) {
      console.log('   No se encontró el grado académico Bachillerato\n');
      return;
    }

    // 2. Buscar cursos de Bachillerato
    const cursos = await prisma.curso.findMany({
      where: {
        id_grado_academico: gradoBachillerato.id_grado_academico,
      },
    });

    console.log('📚 CURSOS DE BACHILLERATO:');
    if (cursos.length === 0) {
      console.log('   No se encontraron cursos de Bachillerato\n');
      return;
    }

    for (const curso of cursos) {
      console.log(`  - ID: ${curso.id_curso}`);
      console.log(`    Nombre: ${curso.nombre}`);
      console.log(`    Sección: ${curso.seccion || 'Sin sección'}`);
      console.log(`    Cupo: ${curso.cupo}`);

      // Buscar orientador
      if (curso.id_orientador) {
        const orientador = await prisma.orientador.findUnique({
          where: { id_orientador: curso.id_orientador },
        });
        if (orientador) {
          console.log(`    Orientador ID: ${orientador.id_orientador}`);
        }
      }
      console.log('');
    }

    // 3. Buscar asignaturas de los cursos
    const cursoIds = cursos.map((c) => c.id_curso);
    const asignaturas = await prisma.asignatura.findMany({
      where: {
        id_curso: {
          in: cursoIds,
        },
      },
    });

    console.log('📖 ASIGNATURAS ASIGNADAS:');
    if (asignaturas.length === 0) {
      console.log('    No hay asignaturas asignadas\n');
    } else {
      for (const asig of asignaturas) {
        console.log(`  - ID: ${asig.id_asignatura}`);
        console.log(`    Nombre: ${asig.nombre}`);
        console.log(`    Curso ID: ${asig.id_curso}`);

        // Buscar tipo de asignatura
        if (asig.id_tipo_asignatura) {
          const tipoAsig = await prisma.tipo_Asignatura.findUnique({
            where: { id_tipo_asignatura: asig.id_tipo_asignatura },
          });
          if (tipoAsig) {
            console.log(`    Tipo: ${tipoAsig.nombre}`);
          }
        }

        // Buscar orientadores asignados
        const orientadoresAsig = await prisma.asignaturaOrientador.findMany({
          where: { id_asignatura: asig.id_asignatura },
        });

        if (orientadoresAsig.length > 0) {
          console.log(`    Orientadores: ${orientadoresAsig.length}`);
        }
        console.log('');
      }
    }

    // 4. Verificar sistema de evaluación
    const sistemaBachillerato = await prisma.sistema_Evaluacion.findFirst({
      where: {
        nombre: 'BACHILLERATO',
      },
    });

    console.log('⚙️  SISTEMA DE EVALUACIÓN:');
    if (sistemaBachillerato) {
      console.log(`  - ID: ${sistemaBachillerato.id_sistema_evaluacion}`);
      console.log(`  - Nombre: ${sistemaBachillerato.nombre}`);
      console.log(`  - Etapas: ${sistemaBachillerato.etapas}`);
      console.log('');
    } else {
      console.log('    No se encontró sistema BACHILLERATO\n');
    }

    // 5. Verificar tipos de evaluación para Bachillerato
    const tiposEvaluacion = await prisma.tipo_evaluacion.findMany({
      where: {
        id_grado_academico: gradoBachillerato.id_grado_academico,
      },
    });

    console.log('📋 TIPOS DE EVALUACIÓN PARA BACHILLERATO:');
    if (tiposEvaluacion.length === 0) {
      console.log('   No hay tipos de evaluación configurados\n');
    } else {
      tiposEvaluacion.forEach((tipo) => {
        console.log(`  - ${tipo.nombre}`);
        console.log(`    Porcentaje: ${tipo.porcentaje}%`);
        console.log(`    Activo: ${tipo.activo ? '✅' : '❌'}`);
        console.log('');
      });
    }

    // 6. Verificar alumnos existentes en estos cursos
    const alumnosCurso = await prisma.alumnoCurso.findMany({
      where: {
        cursoId: {
          in: cursoIds,
        },
        anioAcademico: '2025',
      },
    });

    console.log('👥 ALUMNOS INSCRITOS (2025):');
    if (alumnosCurso.length === 0) {
      console.log('    No hay alumnos inscritos\n');
    } else {
      for (const ac of alumnosCurso) {
        const alumno = await prisma.alumno.findUnique({
          where: { id_alumno: ac.alumnoId },
        });
        if (alumno) {
          console.log(`  - ${alumno.nombre} ${alumno.apellido}`);
          console.log(`    ID Alumno: ${alumno.id_alumno}`);
          console.log(`    Estado: ${ac.estado}`);
          console.log('');
        }
      }
    }

    console.log(' Consulta completada');
  } catch (error) {
    console.error(' Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

consultarBachillerato();
