import { PrismaClient, EstadoAsistencia } from '@prisma/client';

export async function seedAsistenciasConductasTrimestre3(prisma: PrismaClient) {
  console.log('🔹 Seeding: Asistencias y Conductas Trimestre 3...');

  const anio = '2025';
  const trimestre = 3;

  // Obtener datos necesarios
  const curso1 = await prisma.curso.findFirst({
    where: { nombre: 'Quinto Grado' },
  });
  const curso2 = await prisma.curso.findFirst({
    where: { nombre: 'Sexto Grado' },
  });

  if (!curso1 || !curso2) {
    console.log('⚠️  Cursos no encontrados. Saltando seed de asistencias.');
    return;
  }

  // Obtener asignaturas del Curso 1 (Quinto Grado A)
  const asignaturasC1 = await prisma.asignatura.findMany({
    where: { id_curso: curso1.id_curso },
  });

  // Obtener alumnos del Curso 1
  const alumnosC1Inscripciones = await prisma.alumnoCurso.findMany({
    where: { cursoId: curso1.id_curso, estado: 'ACTIVO' },
    include: { alumno: true },
  });
  const alumnosC1 = alumnosC1Inscripciones.map((i) => i.alumno);

  // Obtener orientador
  const orientador = await prisma.orientador.findFirst({
    where: { email: 'orientador@colegio.edu' },
  });

  if (!orientador || alumnosC1.length === 0 || asignaturasC1.length === 0) {
    console.log('⚠️  Datos insuficientes. Saltando seed de asistencias.');
    return;
  }

  console.log(`   📊 Curso: ${curso1.nombre} ${curso1.seccion}`);
  console.log(`   👥 Alumnos: ${alumnosC1.length}`);
  console.log(`   📚 Asignaturas: ${asignaturasC1.length}`);

  // ===== ASISTENCIAS TRIMESTRE 3 =====
  const fechas = [
    { fecha: new Date('2025-08-01T12:00:00Z'), descripcion: 'Todos presentes' },
    {
      fecha: new Date('2025-08-15T12:00:00Z'),
      descripcion: 'Algunas ausencias',
    },
    {
      fecha: new Date('2025-08-20T12:00:00Z'),
      descripcion: 'Ausencia justificada',
    },
    { fecha: new Date('2025-09-05T12:00:00Z'), descripcion: 'Todos presentes' },
    { fecha: new Date('2025-09-10T12:00:00Z'), descripcion: 'Atraso' },
  ];

  let asistenciasCreadas = 0;

  for (const { fecha, descripcion } of fechas) {
    console.log(`   📅 ${fecha.toISOString().split('T')[0]} - ${descripcion}`);

    for (const asignatura of asignaturasC1) {
      for (let i = 0; i < alumnosC1.length; i++) {
        const alumno = alumnosC1[i];
        let estado: EstadoAsistencia = EstadoAsistencia.P;
        let observacion: string | undefined;

        // Lógica de asistencia según fecha y alumno
        if (fecha.toISOString().includes('2025-08-15')) {
          // 15 de agosto: último alumno SP, penúltimo A
          if (i === alumnosC1.length - 1) {
            estado = EstadoAsistencia.SP;
            observacion = 'Ausencia injustificada';
          } else if (i === alumnosC1.length - 2) {
            estado = EstadoAsistencia.A;
            observacion = 'Llegó 15 min tarde';
          }
        } else if (fecha.toISOString().includes('2025-08-20')) {
          // 20 de agosto: último alumno E (justificado)
          if (i === alumnosC1.length - 1) {
            estado = EstadoAsistencia.E;
            observacion = 'Enfermedad (justificante médico)';
          }
        } else if (fecha.toISOString().includes('2025-09-10')) {
          // 10 de septiembre: último alumno A (atraso)
          if (i === alumnosC1.length - 1) {
            estado = EstadoAsistencia.A;
            observacion = 'Llegó tarde';
          }
        }

        // Verificar si ya existe
        const existe = await prisma.asistencia.findUnique({
          where: {
            id_alumno_id_asignatura_fecha: {
              id_alumno: alumno.id_alumno,
              id_asignatura: asignatura.id_asignatura,
              fecha: fecha,
            },
          },
        });

        if (!existe) {
          await prisma.asistencia.create({
            data: {
              id_alumno: alumno.id_alumno,
              id_asignatura: asignatura.id_asignatura,
              id_orientador: orientador.id_orientador,
              fecha: fecha,
              estado: estado,
              observacion: observacion,
              anio_academico: anio,
              trimestre: trimestre,
            },
          });
          asistenciasCreadas++;
        }
      }
    }
  }

  // ===== CONDUCTAS (INFRACCIONES) TRIMESTRE 3 =====
  // Obtener infracciones
  const infraccionLeve = await prisma.infraccionCatalogo.findFirst({
    where: { articulo: 'MG-003' }, // Incumplimiento de tareas
  });
  const infraccionGrave = await prisma.infraccionCatalogo.findFirst({
    where: { articulo: 'G-006' }, // Uso de celular
  });
  const infraccionMuyGrave = await prisma.infraccionCatalogo.findFirst({
    where: { articulo: 'MGV-004' }, // Acoso escolar
  });

  if (!infraccionLeve || !infraccionGrave || !infraccionMuyGrave) {
    console.log('⚠️  Infracciones no encontradas. Saltando conductas.');
    console.log(
      `✅ Asistencias Trimestre 3 OK (${asistenciasCreadas} registros)`,
    );
    return;
  }

  let conductasCreadas = 0;

  // Asignar algunas conductas a alumnos
  if (alumnosC1.length >= 3 && asignaturasC1.length >= 1) {
    const conductas = [
      {
        alumno: alumnosC1[alumnosC1.length - 1], // Último alumno
        infraccion: infraccionLeve,
        fecha: new Date('2025-08-10T10:00:00Z'),
        observacion: 'No entregó la tarea de matemáticas',
      },
      {
        alumno: alumnosC1[alumnosC1.length - 1], // Mismo alumno
        infraccion: infraccionGrave,
        fecha: new Date('2025-08-22T14:30:00Z'),
        observacion: 'Usó el celular durante la clase',
      },
      {
        alumno: alumnosC1[alumnosC1.length - 2], // Penúltimo alumno
        infraccion: infraccionLeve,
        fecha: new Date('2025-09-03T09:00:00Z'),
        observacion: 'Llegó tarde repetidamente',
      },
    ];

    for (const c of conductas) {
      await prisma.conducta.create({
        data: {
          id_alumno: c.alumno.id_alumno,
          id_orientador: orientador.id_orientador,
          id_asignatura: asignaturasC1[0].id_asignatura,
          id_infraccion_catalogo: c.infraccion.id_infraccion,
          fecha: c.fecha,
          observacion: c.observacion,
          anio_academico: anio,
          trimestre: trimestre,
        },
      });
      conductasCreadas++;
    }
  }

  console.log(
    `✅ Asistencias Trimestre 3 OK (${asistenciasCreadas} registros)`,
  );
  console.log(`✅ Conductas Trimestre 3 OK (${conductasCreadas} registros)`);
}
