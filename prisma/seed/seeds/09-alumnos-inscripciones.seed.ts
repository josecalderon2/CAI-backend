import { PrismaClient } from '@prisma/client';

export async function seedAlumnosInscripciones(prisma: PrismaClient) {
  console.log('🔹 Seeding: Alumnos e Inscripciones...');

  const anioActual = '2025';

  // Obtener cursos activos
  const cursos = await prisma.curso.findMany({
    where: { activo: true },
    orderBy: { id_curso: 'asc' },
  });

  if (cursos.length === 0) {
    console.log(
      '⚠️  No hay cursos disponibles. Saltando seed de inscripciones.',
    );
    return;
  }

  // Crear alumnos de ejemplo
  const alumnos = await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const n = i + 1;
      return prisma.alumno.upsert({
        where: { numeroMatricula: `MAT-2025-${n.toString().padStart(4, '0')}` },
        update: {},
        create: {
          nombre: `Alumno${n}`,
          apellido: `Prueba${n}`,
          genero: n % 2 === 1 ? 'M' : 'F',
          fechaNacimiento: `01/0${((i % 9) + 1).toString()}/2010`,
          edad: 14,
          anioEscolar: anioActual,
          numeroMatricula: `MAT-2025-${n.toString().padStart(4, '0')}`,
          fechaMatricula: new Date('2025-01-10'),
          estadoMatricula: 'INSCRITO',
          activo: true,
        },
      });
    }),
  );

  // Distribuir alumnos en cursos
  let asignacionesCreadas = 0;
  for (let i = 0; i < alumnos.length; i++) {
    const cursoIndex = i % cursos.length;
    const alumno = alumnos[i];
    const curso = cursos[cursoIndex];

    const existente = await prisma.alumnoCurso.findUnique({
      where: {
        alumnoId_cursoId_anioAcademico: {
          alumnoId: alumno.id_alumno,
          cursoId: curso.id_curso,
          anioAcademico: anioActual,
        },
      },
    });

    if (!existente) {
      await prisma.alumnoCurso.create({
        data: {
          alumnoId: alumno.id_alumno,
          cursoId: curso.id_curso,
          anioAcademico: anioActual,
          estado: 'ACTIVO',
          fechaInscripcion: new Date('2025-01-15'),
        },
      });
      asignacionesCreadas++;
    }
  }

  console.log(
    `✅ Alumnos e Inscripciones OK (${alumnos.length} alumnos, ${asignacionesCreadas} inscripciones)`,
  );
}
