import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';
import { EvaluacionResponse } from './dto/evaluacion.response';
import { Evaluacion } from '@prisma/client';

@Injectable()
export class EvaluacionesService {
  constructor(private prisma: PrismaService) {}

  private evaluacionSelect = {
    id_evaluacion: true,
    nombre: true,
    puntaje_maximo: true,
    puntaje_minimo: true,
    anio_academico: true,
    mes: true,
    trimestre: true,
    periodo: true,
    createdAt: true,
    tipoEvaluacion: {
      select: {
        id_tipo_evaluacion: true,
        nombre: true,
        porcentaje: true,
      },
    },
    asignatura: {
      select: {
        id_asignatura: true,
        nombre: true,
      },
    },
    orientador: {
      select: {
        id_orientador: true,
        nombre: true,
        apellido: true,
      },
    },
  };

  async create(
    createEvaluacionDto: CreateEvaluacionDto,
    id_orientador: number,
  ) {
    // Verificar que el tipo de evaluación existe
    const tipoEvaluacion = await this.prisma.tipo_evaluacion.findUnique({
      where: { id_tipo_evaluacion: createEvaluacionDto.id_tipo_evaluacion },
      include: {
        grado_academico: true,
      },
    });

    if (!tipoEvaluacion) {
      throw new NotFoundException('Tipo de evaluación no encontrado');
    }

    // Primero obtenemos el orientador
    const orientador = await this.prisma.orientador.findUnique({
      where: { id_orientador: id_orientador },
    });

    if (!orientador) {
      throw new ForbiddenException('No tienes permisos de orientador');
    }

    // Verificar que la asignatura existe y pertenece al orientador
    const asignaturaOrientador =
      await this.prisma.asignaturaOrientador.findFirst({
        where: {
          id_asignatura: createEvaluacionDto.id_asignatura,
          id_orientador: orientador.id_orientador,
          activo: true,
        },
      });

    if (!asignaturaOrientador) {
      throw new ForbiddenException(
        'No tienes permiso para crear evaluaciones en esta asignatura',
      );
    }

    // Obtener la asignatura con su curso y grado académico
    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id_asignatura: createEvaluacionDto.id_asignatura },
      include: {
        curso: {
          include: {
            gradoAcademico: true,
          },
        },
      },
    });

    if (!asignatura || !asignatura.curso || !asignatura.curso.gradoAcademico) {
      throw new NotFoundException(
        'No se pudo determinar el grado académico de la asignatura',
      );
    }

    // Validar que el tipo de evaluación corresponde al grado académico
    if (
      tipoEvaluacion.id_grado_academico !==
      asignatura.curso.gradoAcademico.id_grado_academico
    ) {
      throw new ForbiddenException(
        `El tipo de evaluación "${tipoEvaluacion.nombre}" no es válido para el grado académico "${asignatura.curso.gradoAcademico.nombre}". ` +
          `Este tipo de evaluación es para "${tipoEvaluacion.grado_academico.nombre}".`,
      );
    }

    // Obtener el año académico actual
    const anioActual = new Date().getFullYear().toString();

    // Validaciones específicas por grado académico
    const gradoNombre = asignatura.curso.gradoAcademico.nombre.toUpperCase();

    // VALIDACIONES PARA BÁSICA (PRIMARIA Y SECUNDARIA)
    if (gradoNombre === 'PRIMARIA' || gradoNombre === 'SECUNDARIA') {
      // Tipos que permiten múltiples por mes: Tarea, Revisión de Cuaderno, Laboratorio
      const tiposMultiplesPorMes = [
        'TAREA',
        'REVISIÓN DE CUADERNO',
        'LABORATORIO',
      ];
      // Tipos que solo permiten 1 por trimestre: Actividad Integradora, Autoevaluación, Examen Trimestral
      const tiposUnicoPorTrimestre = [
        'ACTIVIDAD INTEGRADORA',
        'AUTOEVALUACIÓN',
        'EXAMEN TRIMESTRAL',
      ];

      const tipoNombreUpper = tipoEvaluacion.nombre.toUpperCase();

      // Si es un tipo que solo permite 1 por trimestre
      if (tiposUnicoPorTrimestre.includes(tipoNombreUpper)) {
        if (!createEvaluacionDto.trimestre) {
          throw new ForbiddenException(
            `Para "${tipoEvaluacion.nombre}" en ${gradoNombre} es obligatorio especificar el trimestre (1, 2 o 3).`,
          );
        }

        // Verificar que no exista otra evaluación del mismo tipo en el mismo trimestre
        const evaluacionExistente = await this.prisma.evaluacion.findFirst({
          where: {
            id_tipo_evaluacion: createEvaluacionDto.id_tipo_evaluacion,
            id_asignatura: createEvaluacionDto.id_asignatura,
            anio_academico: anioActual,
            trimestre: createEvaluacionDto.trimestre,
          },
        });

        if (evaluacionExistente) {
          throw new ForbiddenException(
            `Ya existe una evaluación de tipo "${tipoEvaluacion.nombre}" para el trimestre ${createEvaluacionDto.trimestre} en esta asignatura. ` +
              `Solo se permite 1 evaluación de este tipo por trimestre.`,
          );
        }
      }

      // Si es un tipo que requiere mínimo 1 por mes
      if (tiposMultiplesPorMes.includes(tipoNombreUpper)) {
        if (!createEvaluacionDto.mes && !createEvaluacionDto.trimestre) {
          throw new ForbiddenException(
            `Para "${tipoEvaluacion.nombre}" en ${gradoNombre} es obligatorio especificar el mes (1-12) o el trimestre (1-3).`,
          );
        }
      }
    }

    // VALIDACIONES PARA BACHILLERATO
    if (gradoNombre === 'BACHILLERATO') {
      if (!createEvaluacionDto.periodo) {
        throw new ForbiddenException(
          `Para BACHILLERATO es obligatorio especificar el periodo (1, 2, 3 o 4).`,
        );
      }

      // En bachillerato, TODAS las evaluaciones solo permiten 1 por periodo
      const evaluacionExistente = await this.prisma.evaluacion.findFirst({
        where: {
          id_tipo_evaluacion: createEvaluacionDto.id_tipo_evaluacion,
          id_asignatura: createEvaluacionDto.id_asignatura,
          anio_academico: anioActual,
          periodo: createEvaluacionDto.periodo,
        },
      });

      if (evaluacionExistente) {
        throw new ForbiddenException(
          `Ya existe una evaluación de tipo "${tipoEvaluacion.nombre}" para el periodo ${createEvaluacionDto.periodo} en esta asignatura. ` +
            `Solo se permite 1 evaluación de cada tipo por periodo en BACHILLERATO.`,
        );
      }
    }

    const evaluacion = await this.prisma.evaluacion.create({
      data: {
        ...createEvaluacionDto,
        id_orientador: orientador.id_orientador,
        anio_academico: anioActual,
      },
      select: this.evaluacionSelect,
    });

    return evaluacion as unknown as EvaluacionResponse;
  }

  async findAll(id_orientador?: number) {
    // Si se proporciona un ID, buscamos primero el orientador
    let where = {};

    if (id_orientador) {
      const orientador = await this.prisma.orientador.findUnique({
        where: { id_orientador: id_orientador },
      });
      if (orientador) {
        where = { id_orientador: orientador.id_orientador };
      }
    }

    const evaluaciones = await this.prisma.evaluacion.findMany({
      where,
      select: this.evaluacionSelect,
      orderBy: [
        { anio_academico: 'desc' },
        { trimestre: 'desc' },
        { mes: 'desc' },
        { periodo: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return evaluaciones as unknown as EvaluacionResponse[];
  }

  async findByOrientadorAsignaturas(id_orientador: number) {
    // Verificar que el orientador existe
    const orientador = await this.prisma.orientador.findUnique({
      where: { id_orientador },
    });

    if (!orientador) {
      throw new ForbiddenException('No tienes permisos de orientador');
    }

    // Obtener las asignaturas asignadas al orientador
    const asignaturasOrientador =
      await this.prisma.asignaturaOrientador.findMany({
        where: {
          id_orientador: orientador.id_orientador,
          activo: true,
        },
        select: {
          id_asignatura: true,
        },
      });

    // Extraer los IDs de las asignaturas
    const asignaturasIds = asignaturasOrientador.map((ao) => ao.id_asignatura);

    // Obtener todas las evaluaciones de esas asignaturas
    const evaluaciones = await this.prisma.evaluacion.findMany({
      where: {
        id_asignatura: {
          in: asignaturasIds,
        },
      },
      select: this.evaluacionSelect,
      orderBy: [
        { anio_academico: 'desc' },
        { trimestre: 'desc' },
        { mes: 'desc' },
        { periodo: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return evaluaciones as unknown as EvaluacionResponse[];
  }

  async findOne(id: number, id_orientador?: number) {
    let where: any = { id_evaluacion: id };

    if (id_orientador) {
      const orientador = await this.prisma.orientador.findUnique({
        where: { id_orientador: id_orientador },
      });
      if (orientador) {
        where.id_orientador = orientador.id_orientador;
      }
    }

    const evaluacion = await this.prisma.evaluacion.findFirst({
      where,
      select: this.evaluacionSelect,
    });

    if (!evaluacion) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    return evaluacion as unknown as EvaluacionResponse;
  }

  async update(
    id: number,
    updateEvaluacionDto: UpdateEvaluacionDto,
    id_orientador: number,
  ) {
    // Obtener el orientador
    const orientador = await this.prisma.orientador.findUnique({
      where: { id_orientador },
    });

    if (!orientador) {
      throw new ForbiddenException('No tienes permisos de orientador');
    }

    // Verificar que la evaluación existe y pertenece al orientador
    const evaluacion = await this.prisma.evaluacion.findFirst({
      where: {
        id_evaluacion: id,
        id_orientador: orientador.id_orientador,
      },
    });

    if (!evaluacion) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    // Si se está actualizando el tipo de evaluación, verificar que existe
    if (updateEvaluacionDto.id_tipo_evaluacion) {
      const tipoEvaluacion = await this.prisma.tipo_evaluacion.findUnique({
        where: { id_tipo_evaluacion: updateEvaluacionDto.id_tipo_evaluacion },
      });

      if (!tipoEvaluacion) {
        throw new NotFoundException('Tipo de evaluación no encontrado');
      }
    }

    // Si se está actualizando la asignatura, verificar que pertenece al orientador
    if (updateEvaluacionDto.id_asignatura) {
      const asignaturaOrientador =
        await this.prisma.asignaturaOrientador.findFirst({
          where: {
            id_asignatura: updateEvaluacionDto.id_asignatura,
            id_orientador,
            activo: true,
          },
        });

      if (!asignaturaOrientador) {
        throw new ForbiddenException(
          'No tienes permiso para asignar esta asignatura',
        );
      }
    }

    const updated = await this.prisma.evaluacion.update({
      where: { id_evaluacion: id },
      data: updateEvaluacionDto,
      select: this.evaluacionSelect,
    });

    return updated as unknown as EvaluacionResponse;
  }

  async remove(id: number, id_orientador: number) {
    // Obtener el orientador
    const orientador = await this.prisma.orientador.findUnique({
      where: { id_orientador },
    });

    if (!orientador) {
      throw new ForbiddenException('No tienes permisos de orientador');
    }

    // Verificar que la evaluación existe y pertenece al orientador
    const evaluacion = await this.prisma.evaluacion.findFirst({
      where: {
        id_evaluacion: id,
        id_orientador,
      },
    });

    if (!evaluacion) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    await this.prisma.evaluacion.delete({
      where: { id_evaluacion: id },
    });

    return { message: 'Evaluación eliminada correctamente' };
  }

  /**
   * Obtiene los tipos de evaluación válidos para una asignatura específica
   * basándose en el grado académico del curso al que pertenece la asignatura
   */
  async getTiposEvaluacionByAsignatura(id_asignatura: number) {
    // Obtener la asignatura con su curso y grado académico
    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id_asignatura },
      include: {
        curso: {
          include: {
            gradoAcademico: true,
          },
        },
      },
    });

    if (!asignatura) {
      throw new NotFoundException('Asignatura no encontrada');
    }

    if (!asignatura.curso || !asignatura.curso.gradoAcademico) {
      throw new NotFoundException(
        'No se pudo determinar el grado académico de la asignatura',
      );
    }

    // Obtener los tipos de evaluación del grado académico
    const tiposEvaluacion = await this.prisma.tipo_evaluacion.findMany({
      where: {
        id_grado_academico: asignatura.curso.gradoAcademico.id_grado_academico,
        activo: true,
      },
      select: {
        id_tipo_evaluacion: true,
        nombre: true,
        porcentaje: true,
        grado_academico: {
          select: {
            id_grado_academico: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return {
      asignatura: {
        id_asignatura: asignatura.id_asignatura,
        nombre: asignatura.nombre,
      },
      gradoAcademico: {
        id_grado_academico: asignatura.curso.gradoAcademico.id_grado_academico,
        nombre: asignatura.curso.gradoAcademico.nombre,
      },
      tiposEvaluacion,
    };
  }

  /**
   * Calcula el porcentaje real de cada evaluación considerando cuántas hay del mismo tipo
   * en el mismo periodo (mes, trimestre o periodo académico)
   */
  async calcularPorcentajesReales(
    id_asignatura: number,
    anio_academico: string,
    trimestre?: number,
    periodo?: number,
  ) {
    // Construir el filtro base
    const where: any = {
      id_asignatura,
      anio_academico,
    };

    if (trimestre) {
      where.trimestre = trimestre;
    }

    if (periodo) {
      where.periodo = periodo;
    }

    // Obtener todas las evaluaciones del periodo
    const evaluaciones = await this.prisma.evaluacion.findMany({
      where,
      include: {
        tipoEvaluacion: true,
      },
    });

    // Agrupar por tipo de evaluación y calcular porcentaje real
    const porcentajesPorTipo = new Map<
      number,
      {
        tipo: string;
        porcentajeBase: number;
        cantidad: number;
        porcentajeCadaUna: number;
        evaluaciones: any[];
      }
    >();

    for (const evaluacion of evaluaciones) {
      const tipoId = evaluacion.id_tipo_evaluacion;

      if (!porcentajesPorTipo.has(tipoId)) {
        porcentajesPorTipo.set(tipoId, {
          tipo: evaluacion.tipoEvaluacion.nombre,
          porcentajeBase: evaluacion.tipoEvaluacion.porcentaje,
          cantidad: 0,
          porcentajeCadaUna: 0,
          evaluaciones: [],
        });
      }

      const grupo = porcentajesPorTipo.get(tipoId)!;
      grupo.cantidad++;
      grupo.evaluaciones.push({
        id_evaluacion: evaluacion.id_evaluacion,
        nombre: evaluacion.nombre,
      });
    }

    // Calcular el porcentaje individual
    const resultado = Array.from(porcentajesPorTipo.values()).map((grupo) => {
      grupo.porcentajeCadaUna = grupo.porcentajeBase / grupo.cantidad;
      return grupo;
    });

    return {
      asignatura: { id_asignatura },
      anio_academico,
      trimestre,
      periodo,
      distribucionPorcentajes: resultado,
      totalPorcentaje: resultado.reduce((sum, g) => sum + g.porcentajeBase, 0),
    };
  }

  /**
   * Obtiene todos los alumnos de una evaluación con sus calificaciones
   * Incluye alumnos que ya tienen calificación y los que aún no
   */
  async getAlumnosConCalificaciones(
    id_evaluacion: number,
    id_orientador: number,
  ) {
    // Verificar que el orientador existe
    const orientador = await this.prisma.orientador.findUnique({
      where: { id_orientador },
    });

    if (!orientador) {
      throw new ForbiddenException('No tienes permisos de orientador');
    }

    // Obtener la evaluación con toda la información relacionada
    const evaluacion = await this.prisma.evaluacion.findFirst({
      where: {
        id_evaluacion,
        id_orientador: orientador.id_orientador,
      },
      include: {
        asignatura: {
          include: {
            curso: {
              select: {
                id_curso: true,
                nombre: true,
                seccion: true,
              },
            },
          },
        },
      },
    });

    if (!evaluacion) {
      throw new NotFoundException(
        'Evaluación no encontrada o no tienes permiso para verla',
      );
    }

    if (!evaluacion.asignatura?.curso) {
      throw new NotFoundException(
        'No se pudo determinar el curso de la evaluación',
      );
    }

    const cursoId = evaluacion.asignatura.curso.id_curso;

    // Obtener todos los alumnos activos del curso
    const alumnosCurso = await this.prisma.alumnoCurso.findMany({
      where: {
        cursoId,
        estado: 'ACTIVO',
        anioAcademico: evaluacion.anio_academico,
      },
      include: {
        alumno: {
          select: {
            id_alumno: true,
            nombre: true,
            apellido: true,
            genero: true,
          },
        },
      },
      orderBy: [
        {
          alumno: {
            apellido: 'asc',
          },
        },
        {
          alumno: {
            nombre: 'asc',
          },
        },
      ],
    });

    // Obtener todas las calificaciones de esta evaluación
    const calificaciones = await this.prisma.notas.findMany({
      where: {
        id_evaluacion,
      },
      select: {
        id_nota: true,
        id_alumno: true,
        calificacion: true,
      },
    });

    // Crear un mapa de calificaciones por alumno para acceso rápido
    const calificacionesPorAlumno = new Map(
      calificaciones.map((cal) => [cal.id_alumno, cal]),
    );

    // Combinar alumnos con sus calificaciones
    const alumnosConCalificaciones = alumnosCurso.map((ac) => {
      const calificacion = calificacionesPorAlumno.get(ac.alumno.id_alumno);

      return {
        id_alumno: ac.alumno.id_alumno,
        nombre: ac.alumno.nombre,
        apellido: ac.alumno.apellido,
        genero: ac.alumno.genero,
        calificacion: calificacion?.calificacion ?? null,
        id_nota: calificacion?.id_nota ?? null,
        tiene_calificacion: !!calificacion,
      };
    });

    // Calcular estadísticas
    const totalAlumnos = alumnosConCalificaciones.length;
    const alumnosCalificados = alumnosConCalificaciones.filter(
      (a) => a.tiene_calificacion,
    ).length;

    return {
      id_evaluacion: evaluacion.id_evaluacion,
      nombre_evaluacion: evaluacion.nombre,
      asignatura: {
        id_asignatura: evaluacion.asignatura.id_asignatura,
        nombre: evaluacion.asignatura.nombre,
      },
      curso: evaluacion.asignatura.curso,
      total_alumnos: totalAlumnos,
      alumnos_calificados: alumnosCalificados,
      alumnos: alumnosConCalificaciones,
    };
  }
}
