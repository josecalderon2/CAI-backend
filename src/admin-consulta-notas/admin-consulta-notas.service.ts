import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminConsultaNotasService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene todas las evaluaciones de un curso con sus calificaciones
   */
  async obtenerEvaluacionesCurso(
    cursoId: number,
    anioAcademico: string,
    asignaturaId?: number,
  ) {
    const curso = await this.prisma.curso.findUnique({
      where: { id_curso: cursoId },
      include: {
        gradoAcademico: true,
      },
    });

    if (!curso) {
      throw new NotFoundException(`Curso con ID ${cursoId} no encontrado`);
    }

    const whereAsignatura: any = {
      id_curso: cursoId,
    };

    if (asignaturaId) {
      whereAsignatura.id_asignatura = asignaturaId;
    }

    const asignaturas = await this.prisma.asignatura.findMany({
      where: whereAsignatura,
      include: {
        tipoAsignatura: true,
        sistemaEvaluacion: true,
      },
    });

    if (asignaturas.length === 0) {
      throw new NotFoundException(
        'No se encontraron asignaturas para este curso',
      );
    }

    const alumnosCurso = await this.prisma.alumnoCurso.findMany({
      where: {
        cursoId: cursoId,
        anioAcademico: anioAcademico,
        estado: 'ACTIVO',
      },
      include: {
        alumno: true,
      },
      orderBy: {
        alumno: {
          apellido: 'asc',
        },
      },
    });

    const alumnos = alumnosCurso.map((ac) => ac.alumno);

    const resultado: any[] = [];

    for (const asignatura of asignaturas) {
      const evaluaciones = await this.prisma.evaluacion.findMany({
        where: {
          id_asignatura: asignatura.id_asignatura,
          anio_academico: anioAcademico,
        },
        include: {
          tipoEvaluacion: true,
          notas: {
            where: {
              id_alumno: {
                in: alumnos.map((a) => a.id_alumno),
              },
            },
          },
        },
        orderBy: [{ periodo: 'asc' }, { trimestre: 'asc' }, { mes: 'asc' }],
      });

      const evaluacionesConNotas = evaluaciones.map((evaluacion) => {
        const notasPorAlumno = alumnos.map((alumno) => {
          const nota = evaluacion.notas.find(
            (n) => n.id_alumno === alumno.id_alumno,
          );

          return {
            alumnoId: alumno.id_alumno,
            nombreCompleto: `${alumno.nombre} ${alumno.apellido}`,
            calificacion: nota ? nota.calificacion : null,
            fechaRegistro: nota ? nota.fecha_registro : null,
          };
        });

        return {
          id_evaluacion: evaluacion.id_evaluacion,
          nombre: evaluacion.nombre,
          tipo: evaluacion.tipoEvaluacion.nombre,
          porcentaje: evaluacion.tipoEvaluacion.porcentaje,
          puntajeMaximo: evaluacion.puntaje_maximo,
          periodo: evaluacion.periodo,
          trimestre: evaluacion.trimestre,
          mes: evaluacion.mes,
          notas: notasPorAlumno,
        };
      });

      resultado.push({
        asignatura: {
          id: asignatura.id_asignatura,
          nombre: asignatura.nombre,
          tipo: asignatura.tipoAsignatura?.nombre,
        },
        evaluaciones: evaluacionesConNotas,
      });
    }

    return {
      curso: {
        id: curso.id_curso,
        nombre: curso.nombre,
        seccion: curso.seccion,
        grado: curso.gradoAcademico?.nombre,
      },
      anioAcademico,
      alumnos: alumnos.map((a) => ({
        id: a.id_alumno,
        nombre: a.nombre,
        apellido: a.apellido,
      })),
      asignaturas: resultado,
    };
  }

  /**
   * Obtiene las calificaciones de una evaluación específica
   */
  async obtenerCalificacionesPorEvaluacion(
    evaluacionId: number,
    anioAcademico: string,
  ) {
    const evaluacion = await this.prisma.evaluacion.findUnique({
      where: { id_evaluacion: evaluacionId },
      include: {
        tipoEvaluacion: true,
        asignatura: {
          include: {
            curso: {
              include: {
                gradoAcademico: true,
              },
            },
          },
        },
      },
    });

    if (!evaluacion) {
      throw new NotFoundException(
        `Evaluación con ID ${evaluacionId} no encontrada`,
      );
    }

    if (!evaluacion.asignatura?.curso) {
      throw new NotFoundException('Evaluación no tiene curso asignado');
    }

    const alumnosCurso = await this.prisma.alumnoCurso.findMany({
      where: {
        cursoId: evaluacion.asignatura.curso.id_curso,
        anioAcademico: anioAcademico,
        estado: 'ACTIVO',
      },
      include: {
        alumno: true,
      },
      orderBy: {
        alumno: {
          apellido: 'asc',
        },
      },
    });

    const notas = await this.prisma.notas.findMany({
      where: {
        id_evaluacion: evaluacionId,
        id_alumno: {
          in: alumnosCurso.map((ac) => ac.alumno.id_alumno),
        },
      },
    });

    const notasMap = new Map<number, any>();
    notas.forEach((nota) => {
      notasMap.set(nota.id_alumno, nota);
    });

    const calificaciones = alumnosCurso.map((ac) => {
      const nota = notasMap.get(ac.alumno.id_alumno);

      return {
        alumno: {
          id: ac.alumno.id_alumno,
          nombre: ac.alumno.nombre,
          apellido: ac.alumno.apellido,
          nombreCompleto: `${ac.alumno.nombre} ${ac.alumno.apellido}`,
        },
        calificacion: nota ? nota.calificacion : null,
        fechaRegistro: nota ? nota.fecha_registro : null,
        aprobado: nota ? nota.calificacion >= 6.0 : null,
      };
    });

    const notasConCalificacion = calificaciones.filter(
      (c) => c.calificacion !== null,
    );
    const promedioGrupo =
      notasConCalificacion.length > 0
        ? notasConCalificacion.reduce((sum, c) => sum + c.calificacion, 0) /
          notasConCalificacion.length
        : null;

    const notaMaxima =
      notasConCalificacion.length > 0
        ? Math.max(...notasConCalificacion.map((c) => c.calificacion))
        : null;

    const notaMinima =
      notasConCalificacion.length > 0
        ? Math.min(...notasConCalificacion.map((c) => c.calificacion))
        : null;

    const aprobados = notasConCalificacion.filter(
      (c) => c.calificacion >= 6.0,
    ).length;
    const reprobados = notasConCalificacion.filter(
      (c) => c.calificacion < 6.0,
    ).length;

    return {
      evaluacion: {
        id: evaluacion.id_evaluacion,
        nombre: evaluacion.nombre,
        tipo: evaluacion.tipoEvaluacion.nombre,
        porcentaje: evaluacion.tipoEvaluacion.porcentaje,
        puntajeMaximo: evaluacion.puntaje_maximo,
        puntajeMinimo: evaluacion.puntaje_minimo,
        periodo: evaluacion.periodo,
        trimestre: evaluacion.trimestre,
        mes: evaluacion.mes,
      },
      asignatura: {
        id: evaluacion.asignatura.id_asignatura,
        nombre: evaluacion.asignatura.nombre,
      },
      curso: {
        id: evaluacion.asignatura.curso.id_curso,
        nombre: evaluacion.asignatura.curso.nombre,
        seccion: evaluacion.asignatura.curso.seccion,
        grado: evaluacion.asignatura.curso.gradoAcademico?.nombre,
      },
      calificaciones,
      estadisticas: {
        totalAlumnos: alumnosCurso.length,
        alumnosCalificados: notasConCalificacion.length,
        alumnosPendientes: alumnosCurso.length - notasConCalificacion.length,
        promedioGrupo: promedioGrupo
          ? parseFloat(promedioGrupo.toFixed(2))
          : null,
        notaMaxima,
        notaMinima,
        aprobados,
        reprobados,
        porcentajeAprobacion:
          notasConCalificacion.length > 0
            ? parseFloat(
                ((aprobados / notasConCalificacion.length) * 100).toFixed(2),
              )
            : null,
      },
    };
  }

  /**
   * Obtiene el resumen de promedios de un curso
   */
  async obtenerResumenPromediosCurso(cursoId: number, anioAcademico: string) {
    const curso = await this.prisma.curso.findUnique({
      where: { id_curso: cursoId },
      include: {
        gradoAcademico: true,
      },
    });

    if (!curso) {
      throw new NotFoundException(`Curso con ID ${cursoId} no encontrado`);
    }

    const alumnosCurso = await this.prisma.alumnoCurso.findMany({
      where: {
        cursoId: cursoId,
        anioAcademico: anioAcademico,
        estado: 'ACTIVO',
      },
      include: {
        alumno: true,
      },
      orderBy: {
        alumno: {
          apellido: 'asc',
        },
      },
    });

    const resultado: any[] = [];

    for (const ac of alumnosCurso) {
      const promedioGeneral = await this.prisma.promedioFinalAlumno.findUnique({
        where: {
          alumnoId_cursoId_anioAcademico: {
            alumnoId: ac.alumno.id_alumno,
            cursoId: cursoId,
            anioAcademico: anioAcademico,
          },
        },
      });

      const promediosAsignaturas =
        await this.prisma.promedioFinalAsignatura.findMany({
          where: {
            alumnoId: ac.alumno.id_alumno,
            anioAcademico: anioAcademico,
          },
          include: {
            asignatura: true,
          },
        });

      resultado.push({
        alumno: {
          id: ac.alumno.id_alumno,
          nombre: ac.alumno.nombre,
          apellido: ac.alumno.apellido,
          nombreCompleto: `${ac.alumno.nombre} ${ac.alumno.apellido}`,
        },
        promedioGeneral: promedioGeneral
          ? {
              promedio: promedioGeneral.promedioGeneral,
              estado: promedioGeneral.estadoFinal,
              aprobadoTodas: promedioGeneral.aprobadoTodasAsignaturas,
              asignaturasReprobadas: promedioGeneral.asignaturasReprobadas,
              calificacionesCerradas: promedioGeneral.calificacionesCerradas,
            }
          : null,
        asignaturas: promediosAsignaturas.map((pa) => ({
          nombre: pa.asignatura.nombre,
          promedio: pa.promedioFinal,
          aprobado: pa.aprobado,
        })),
      });
    }

    return {
      curso: {
        id: curso.id_curso,
        nombre: curso.nombre,
        seccion: curso.seccion,
        grado: curso.gradoAcademico?.nombre,
      },
      anioAcademico,
      alumnos: resultado,
    };
  }
}
