import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function crearAlumnosBachillerato() {
  try {
    console.log('=== CREANDO ALUMNOS PARA BACHILLERATO ===\n');

    // Buscar el curso de Primer Año de Bachillerato
    const curso = await prisma.curso.findFirst({
      where: {
        nombre: 'Primer Año de Bachillerato',
      },
    });

    if (!curso) {
      console.log('❌ No se encontró el curso de Primer Año de Bachillerato');
      return;
    }

    console.log(
      `📚 Curso encontrado: ${curso.nombre} - Sección ${curso.seccion}\n`,
    );

    // Datos de alumnos de prueba para Bachillerato
    const alumnosData = [
      {
        nombre: 'Carlos',
        apellido: 'Martínez',
        genero: 'M',
        fechaNacimiento: '15/08/2008',
        activo: true,
      },
      {
        nombre: 'María',
        apellido: 'Rodríguez',
        genero: 'F',
        fechaNacimiento: '22/03/2008',
        activo: true,
      },
      {
        nombre: 'José',
        apellido: 'García',
        genero: 'M',
        fechaNacimiento: '10/11/2008',
        activo: true,
      },
    ];

    console.log('👥 Creando alumnos...\n');

    for (const alumnoData of alumnosData) {
      // Crear o buscar el alumno
      let alumno = await prisma.alumno.findFirst({
        where: {
          nombre: alumnoData.nombre,
          apellido: alumnoData.apellido,
        },
      });

      if (!alumno) {
        alumno = await prisma.alumno.create({
          data: alumnoData,
        });
        console.log(
          ` Alumno creado: ${alumno.nombre} ${alumno.apellido} (ID: ${alumno.id_alumno})`,
        );
      } else {
        console.log(
          `ℹ  Alumno ya existe: ${alumno.nombre} ${alumno.apellido} (ID: ${alumno.id_alumno})`,
        );
      }

      // Verificar si ya está inscrito en el curso para 2025
      const inscripcionExistente = await prisma.alumnoCurso.findFirst({
        where: {
          alumnoId: alumno.id_alumno,
          cursoId: curso.id_curso,
          anioAcademico: '2025',
        },
      });

      if (!inscripcionExistente) {
        // Inscribir al alumno en el curso
        await prisma.alumnoCurso.create({
          data: {
            alumnoId: alumno.id_alumno,
            cursoId: curso.id_curso,
            anioAcademico: '2025',
            estado: 'ACTIVO',
            fechaInscripcion: new Date(),
          },
        });
        console.log(`   📝 Inscrito en ${curso.nombre} - 2025`);
      } else {
        console.log(`   ℹ  Ya inscrito en ${curso.nombre} - 2025`);
      }
      console.log('');
    }

    // Mostrar resumen
    const totalInscritos = await prisma.alumnoCurso.count({
      where: {
        cursoId: curso.id_curso,
        anioAcademico: '2025',
        estado: 'ACTIVO',
      },
    });

    console.log('📊 RESUMEN:');
    console.log(
      `   Total de alumnos inscritos en ${curso.nombre}: ${totalInscritos}`,
    );
    console.log('');
    console.log('✅ Proceso completado');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

crearAlumnosBachillerato();
