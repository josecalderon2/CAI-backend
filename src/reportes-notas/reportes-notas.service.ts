import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EvaluacionesService } from '../evaluaciones/evaluaciones.service';

@Injectable()
export class ReportesNotasService {
  constructor(
    private prisma: PrismaService,
    private evaluacionesService: EvaluacionesService,
  ) {}

  async evaluacionesPorAsignatura(
    id_asignatura?: number,
    anio?: string,
    trimestre?: number,
    periodo?: number,
  ) {
    if (!id_asignatura) {
      throw new NotFoundException('Se requiere id_asignatura');
    }

    const anioUsar = anio || new Date().getFullYear().toString();
    return this.evaluacionesService.calcularPorcentajesReales(
      id_asignatura,
      anioUsar,
      trimestre,
      periodo,
    );
  }

  async alumnosConCalificaciones(id_evaluacion: number, id_orientador: number) {
    return this.evaluacionesService.getAlumnosConCalificaciones(
      id_evaluacion,
      id_orientador,
    );
  }

  async notasHistoricasPorAlumno(id_alumno: number, anio?: string) {
    const notas = await this.prisma.notas.findMany({
      where: { id_alumno },
      include: {
        asignatura: true,
        evaluacion: { include: { tipoEvaluacion: true } },
      },
      orderBy: { fecha_registro: 'desc' },
    });

    if (anio) {
      return notas.filter(
        (n) => n.evaluacion?.anio_academico === anio || !n.evaluacion,
      );
    }

    return notas;
  }

  async promediosPorAlumno(id_alumno: number, anio?: string) {
    const anioUsar = anio || new Date().getFullYear().toString();

    const [mensuales, trimestrales, periodos, finalesAsignatura] =
      await Promise.all([
        this.prisma.promedioMensual.findMany({
          where: { alumnoId: id_alumno, anioAcademico: anioUsar },
          include: { asignatura: true },
        }),
        this.prisma.promedioTrimestral.findMany({
          where: { alumnoId: id_alumno, anioAcademico: anioUsar },
          include: { asignatura: true },
        }),
        this.prisma.promedioPeriodo.findMany({
          where: { alumnoId: id_alumno, anioAcademico: anioUsar },
          include: { asignatura: true },
        }),
        this.prisma.promedioFinalAsignatura.findMany({
          where: { alumnoId: id_alumno, anioAcademico: anioUsar },
          include: { asignatura: true },
        }),
      ]);

    const finalAlumno = await this.prisma.promedioFinalAlumno.findFirst({
      where: { alumnoId: id_alumno, anioAcademico: anioUsar },
    });

    return {
      anio: anioUsar,
      mensuales: mensuales || [],
      trimestrales: trimestrales || [],
      periodos: periodos || [],
      finalesAsignatura: finalesAsignatura || [],
      finalAlumno: finalAlumno || null,
    };
  }

  async rankingPorCurso(id_curso: number, anio?: string, top = 10) {
    const anioUsar = anio || new Date().getFullYear().toString();
    const ranking = await this.prisma.promedioFinalAlumno.findMany({
      where: { cursoId: id_curso, anioAcademico: anioUsar },
      orderBy: { promedioGeneral: 'desc' },
      take: top,
      include: { alumno: true },
    });

    return ranking;
  }

  async distribucionPorAsignatura(id_asignatura: number, anio?: string) {
    const notas = await this.prisma.notas.findMany({
      where: { id_asignatura: id_asignatura },
      include: { evaluacion: true },
    });

    const filtered = anio
      ? notas.filter(
          (n) => n.evaluacion?.anio_academico === anio || !n.evaluacion,
        )
      : notas;
    const valores = filtered
      .map((n) => n.calificacion)
      .filter((v) => v !== null && v !== undefined) as number[];

    if (valores.length === 0)
      return {
        count: 0,
        min: null,
        max: null,
        mean: null,
        median: null,
        stddev: null,
      };

    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const mean = valores.reduce((a, b) => a + b, 0) / valores.length;
    const sorted = [...valores].sort((a, b) => a - b);
    const median =
      sorted.length % 2 === 1
        ? sorted[(sorted.length - 1) / 2]
        : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    const variance =
      valores.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / valores.length;
    const stddev = Math.sqrt(variance);

    return { count: valores.length, min, max, mean, median, stddev };
  }

  async pendientesPorEvaluacion(id_evaluacion: number) {
    const evaluacion = await this.prisma.evaluacion.findUnique({
      include: { asignatura: { include: { curso: true } } },
      where: { id_evaluacion },
    });
    if (!evaluacion) throw new NotFoundException('Evaluación no encontrada');

    const cursoId = evaluacion.asignatura?.id_curso;
    const anio = evaluacion.anio_academico;
    if (!cursoId) throw new NotFoundException('Curso asociado no encontrado');

    const inscripciones = await this.prisma.alumnoCurso.findMany({
      where: { cursoId: cursoId, anioAcademico: anio, estado: 'ACTIVO' },
      include: { alumno: true },
    });
    const alumnosIds = inscripciones.map((i) => i.alumnoId);

    const notas = await this.prisma.notas.findMany({
      where: { id_evaluacion, id_alumno: { in: alumnosIds } },
    });

    const conNota = new Set(notas.map((n) => n.id_alumno));
    const pendientes = inscripciones
      .filter((i) => !conNota.has(i.alumnoId))
      .map((i) => ({
        id_alumno: i.alumnoId,
        nombre: i.alumno.nombre,
        apellido: i.alumno.apellido,
      }));

    return {
      evaluacion: {
        id_evaluacion: evaluacion.id_evaluacion,
        nombre: evaluacion.nombre,
      },
      total_alumnos: alumnosIds.length,
      registrados: notas.length,
      pendientes,
    };
  }

  async boletaAlumno(id_alumno: number, anio?: string) {
    const anioUsar = anio || new Date().getFullYear().toString();

    const finales = await this.prisma.promedioFinalAsignatura.findMany({
      where: { alumnoId: id_alumno, anioAcademico: anioUsar },
      include: { asignatura: true },
    });

    const finalAlumno = await this.prisma.promedioFinalAlumno.findFirst({
      where: { alumnoId: id_alumno, anioAcademico: anioUsar },
    });

    const conductas = await this.prisma.conducta.findMany({
      where: { id_alumno, anio_academico: anioUsar },
      include: { infraccion: true },
    });

    const asistencias = await this.prisma.asistencia.findMany({
      where: { id_alumno, anio_academico: anioUsar },
    });
    const totalAsist = asistencias.length;
    const presentes = asistencias.filter((a) => a.estado === 'P').length;
    const porcentajeAsistencia =
      totalAsist === 0
        ? null
        : Math.round((presentes / totalAsist) * 100 * 100) / 100;

    return {
      anio: anioUsar,
      finalesAsignatura: finales,
      finalAlumno: finalAlumno || null,
      conductasResumen: {
        total: conductas.length,
        detalles: conductas,
      },
      asistencia: {
        total: totalAsist,
        presentes,
        porcentaje: porcentajeAsistencia,
      },
    };
  }

  /**
   * 📄 Boleta detallada del alumno para ORIENTADORES (reporte para padres)
   * Muestra todas las notas de evaluaciones del trimestre/periodo seleccionado
   * Filtra por trimestre (BÁSICA) o periodo (BACHILLERATO)
   */
  async boletaDetalladaAlumno(
    id_alumno: number,
    anio?: string,
    trimestre?: number,
    periodo?: number,
  ) {
    const anioUsar = anio || new Date().getFullYear().toString();

    // Obtener información del alumno y su curso
    const alumno = await this.prisma.alumno.findUnique({
      where: { id_alumno },
      include: {
        inscripciones: {
          where: { anioAcademico: anioUsar, estado: 'ACTIVO' },
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

    if (!alumno || alumno.inscripciones.length === 0) {
      throw new NotFoundException(
        'Alumno no encontrado o sin inscripción activa',
      );
    }

    const inscripcion = alumno.inscripciones[0];
    const curso = inscripcion.curso;
    const gradoNombre = curso.gradoAcademico?.nombre || '';
    const esBachillerato = gradoNombre.includes('Bachillerato');

    // Validar filtros según el nivel
    if (esBachillerato && trimestre) {
      throw new NotFoundException(
        'Bachillerato usa periodos, no trimestres. Use el parámetro "periodo"',
      );
    }
    if (!esBachillerato && periodo) {
      throw new NotFoundException(
        'Básica usa trimestres, no periodos. Use el parámetro "trimestre"',
      );
    }

    // Obtener todas las asignaturas del curso
    const asignaturas = await this.prisma.asignatura.findMany({
      where: { id_curso: curso.id_curso },
      include: {
        orientadores: {
          select: {
            orientador: {
              select: {
                id_orientador: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
      },
    });

    // Para cada asignatura, obtener sus evaluaciones y notas del periodo/trimestre
    const asignaturasConNotas = await Promise.all(
      asignaturas.map(async (asignatura) => {
        const whereEvaluacion: any = {
          id_asignatura: asignatura.id_asignatura,
          anio_academico: anioUsar,
        };

        if (esBachillerato && periodo) {
          whereEvaluacion.periodo = periodo;
        } else if (!esBachillerato && trimestre) {
          whereEvaluacion.OR = [
            { trimestre },
            { mes: trimestre * 3 - 2 },
            { mes: trimestre * 3 - 1 },
            { mes: trimestre * 3 },
          ];
        }

        const evaluaciones = await this.prisma.evaluacion.findMany({
          where: whereEvaluacion,
          include: {
            tipoEvaluacion: true,
            notas: {
              where: { id_alumno },
            },
          },
          orderBy: [
            { mes: 'asc' },
            { trimestre: 'asc' },
            { periodo: 'asc' },
            { id_evaluacion: 'asc' },
          ],
        });

        const evaluacionesConNota = evaluaciones.map((evaluacion) => ({
          id_evaluacion: evaluacion.id_evaluacion,
          nombre: evaluacion.nombre,
          tipo: evaluacion.tipoEvaluacion.nombre,
          porcentaje: evaluacion.tipoEvaluacion.porcentaje,
          trimestre: evaluacion.trimestre,
          periodo: evaluacion.periodo,
          mes: evaluacion.mes,
          nota: evaluacion.notas[0]?.calificacion || null,
          fecha_registro: evaluacion.notas[0]?.fecha_registro || null,
        }));

        // Calcular promedio del periodo/trimestre en tiempo real
        let promedioDelPeriodo: number | null = null;

        // Filtrar evaluaciones con nota para el cálculo
        const evaluacionesConNotaValida = evaluacionesConNota.filter(
          (e) => e.nota !== null && e.nota !== undefined,
        );

        if (evaluacionesConNotaValida.length > 0) {
          // Calcular suma ponderada: (nota * porcentaje)
          const sumaPonderada = evaluacionesConNotaValida.reduce(
            (sum, ev) => sum + ev.nota! * ev.porcentaje,
            0,
          );

          // Calcular suma total de porcentajes de las evaluaciones con nota
          const sumaPorcentajes = evaluacionesConNotaValida.reduce(
            (sum, ev) => sum + ev.porcentaje,
            0,
          );

          // Promedio ponderado = suma ponderada / suma de porcentajes
          if (sumaPorcentajes > 0) {
            promedioDelPeriodo =
              Math.round((sumaPonderada / sumaPorcentajes) * 100) / 100;
          }
        }

        const orientador = asignatura.orientadores[0]?.orientador;

        return {
          id_asignatura: asignatura.id_asignatura,
          nombre: asignatura.nombre,
          orientador: orientador
            ? `${orientador.nombre} ${orientador.apellido}`
            : null,
          evaluaciones: evaluacionesConNota,
          promedio_periodo: promedioDelPeriodo,
        };
      }),
    );

    // Obtener conductas del periodo/trimestre
    const conductas = await this.prisma.conducta.findMany({
      where: {
        id_alumno,
        anio_academico: anioUsar,
        ...(esBachillerato && periodo ? { periodo } : {}),
        ...(!esBachillerato && trimestre ? { trimestre } : {}),
      },
      include: {
        infraccion: true,
        orientador: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });

    // Obtener asistencias (no se filtran por periodo/trimestre ya que son diarias)
    const asistencias = await this.prisma.asistencia.findMany({
      where: { id_alumno, anio_academico: anioUsar },
    });
    const totalAsist = asistencias.length;
    const presentes = asistencias.filter(
      (a) => a.estado === 'P' || a.estado === 'E',
    ).length;
    const ausentes = asistencias.filter((a) => a.estado === 'SP').length;
    const tardanzas = asistencias.filter((a) => a.estado === 'A').length;
    const porcentajeAsistencia =
      totalAsist === 0
        ? null
        : Math.round((presentes / totalAsist) * 100 * 100) / 100;

    // Calcular promedio general del periodo/trimestre
    const asignaturasConPromedio = asignaturasConNotas.filter(
      (a) => a.promedio_periodo !== null,
    );

    const promedioGeneralPeriodo =
      asignaturasConPromedio.length > 0
        ? Math.round(
            (asignaturasConPromedio.reduce(
              (sum, asig) => sum + (asig.promedio_periodo || 0),
              0,
            ) /
              asignaturasConPromedio.length) *
              100,
          ) / 100
        : null;

    return {
      alumno: {
        id_alumno: alumno.id_alumno,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        numeroMatricula: alumno.numeroMatricula,
      },
      curso: {
        id_curso: curso.id_curso,
        nombre: curso.nombre,
        grado: gradoNombre,
        es_bachillerato: esBachillerato,
      },
      periodo_academico: {
        anio: anioUsar,
        trimestre: trimestre || null,
        periodo: periodo || null,
        nombre: esBachillerato
          ? `Periodo ${periodo}`
          : `Trimestre ${trimestre}`,
      },
      asignaturas: asignaturasConNotas,
      promedio_general_periodo: promedioGeneralPeriodo,
      conductas: {
        total: conductas.length,
        puntos_acumulados: conductas.reduce(
          (sum, c) => sum + (c.infraccion?.puntos || 0),
          0,
        ),
        detalles: conductas.map((c) => ({
          id_conducta: c.id_conducta,
          fecha: c.fecha,
          observacion: c.observacion,
          orientador: c.orientador
            ? `${c.orientador.nombre} ${c.orientador.apellido}`
            : null,
          infraccion: {
            categoria: c.infraccion?.categoria,
            articulo: c.infraccion?.articulo,
            descripcion: c.infraccion?.descripcion,
            puntos: c.infraccion?.puntos,
          },
        })),
      },
      asistencia: {
        total_registros: totalAsist,
        presentes,
        ausentes,
        tardanzas,
        porcentaje_asistencia: porcentajeAsistencia,
      },
    };
  }
}
