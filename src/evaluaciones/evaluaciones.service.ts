import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';
import { FiltrosHistorialDto } from './dto/filtros-historial.dto';

@Injectable()
export class EvaluacionesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear una nueva evaluación
   * @param createEvaluacionDto - Datos de la evaluación a crear
   * @param idOrientador - ID del orientador que crea la evaluación
   */
  async create(createEvaluacionDto: CreateEvaluacionDto, idOrientador: number) {
    // Validar que el tipo de evaluación existe y está activo
    const tipoEvaluacion = await this.prisma.tipo_evaluacion.findUnique({
      where: { id_tipo_evaluacion: createEvaluacionDto.id_tipo_evaluacion },
    });

    if (!tipoEvaluacion) {
      throw new NotFoundException(
        `Tipo de evaluación con ID ${createEvaluacionDto.id_tipo_evaluacion} no encontrado`,
      );
    }

    if (!tipoEvaluacion.activo) {
      throw new BadRequestException(
        `No se puede crear una evaluación con un tipo de evaluación inactivo`,
      );
    }

    // Validar que la asignatura existe y está asignada al orientador
    const asignacionOrientador = await this.prisma.asignaturaOrientador.findFirst({
      where: {
        id_asignatura: createEvaluacionDto.id_asignatura,
        id_orientador: idOrientador,
        activo: true,
      },
      include: {
        asignatura: true,
      },
    });

    if (!asignacionOrientador) {
      throw new BadRequestException(
        `No tienes asignada esta asignatura o la asignación no está activa`,
      );
    }

    // Validar que el puntaje mínimo no sea mayor que el máximo
    if (
      createEvaluacionDto.puntaje_minimo !== undefined &&
      createEvaluacionDto.puntaje_maximo !== undefined &&
      createEvaluacionDto.puntaje_minimo > createEvaluacionDto.puntaje_maximo
    ) {
      throw new BadRequestException(
        'El puntaje mínimo no puede ser mayor que el puntaje máximo',
      );
    }

    // Verificar si ya existe una evaluación con el mismo nombre para esta asignatura
    const evaluacionExistente = await this.prisma.evaluacion.findFirst({
      where: {
        nombre: createEvaluacionDto.nombre,
        id_asignatura: createEvaluacionDto.id_asignatura,
        id_orientador: idOrientador,
      },
    });

    if (evaluacionExistente) {
      throw new ConflictException(
        `Ya existe una evaluación con el nombre "${createEvaluacionDto.nombre}" para esta asignatura`,
      );
    }

    // Crear la evaluación
    const evaluacion = await this.prisma.evaluacion.create({
      data: {
        nombre: createEvaluacionDto.nombre,
        puntaje_minimo: createEvaluacionDto.puntaje_minimo,
        puntaje_maximo: createEvaluacionDto.puntaje_maximo,
        id_tipo_evaluacion: createEvaluacionDto.id_tipo_evaluacion,
        id_asignatura: createEvaluacionDto.id_asignatura,
        id_orientador: idOrientador,
      },
      include: {
        tipoEvaluacion: true,
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
      },
    });

    return {
      message: 'Evaluación creada exitosamente',
      evaluacion,
    };
  }

  /**
   * Obtener todas las evaluaciones del orientador
   * @param idOrientador - ID del orientador (si es null, es Admin/P.A y ve todas)
   */
  async findAll(idOrientador?: number) {
    const where: any = {};
    
    // Si es orientador, solo ve sus evaluaciones
    if (idOrientador) {
      where.id_orientador = idOrientador;
    }

    const evaluaciones = await this.prisma.evaluacion.findMany({
      where,
      include: {
        tipoEvaluacion: true,
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
        _count: {
          select: { notas: true },
        },
      },
      orderBy: [
        { asignatura: { nombre: 'asc' } },
        { nombre: 'asc' },
      ],
    });

    return {
      total: evaluaciones.length,
      evaluaciones,
    };
  }

  /**
   * Obtener evaluaciones por tipo de evaluación
   * @param idTipoEvaluacion - ID del tipo de evaluación
   * @param idOrientador - ID del orientador (opcional, para filtrar)
   */
  async findByTipo(idTipoEvaluacion: number, idOrientador?: number) {
    // Validar que el tipo de evaluación existe
    const tipoEvaluacion = await this.prisma.tipo_evaluacion.findUnique({
      where: { id_tipo_evaluacion: idTipoEvaluacion },
    });

    if (!tipoEvaluacion) {
      throw new NotFoundException(
        `Tipo de evaluación con ID ${idTipoEvaluacion} no encontrado`,
      );
    }

    const where: any = { id_tipo_evaluacion: idTipoEvaluacion };
    
    if (idOrientador) {
      where.id_orientador = idOrientador;
    }

    const evaluaciones = await this.prisma.evaluacion.findMany({
      where,
      include: {
        tipoEvaluacion: true,
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
        _count: {
          select: { notas: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    return {
      tipoEvaluacion: tipoEvaluacion.nombre,
      total: evaluaciones.length,
      evaluaciones,
    };
  }

  /**
   * Obtener una evaluación por ID
   * @param id - ID de la evaluación
   * @param idOrientador - ID del orientador (para validar propiedad)
   */
  async findOne(id: number, idOrientador?: number) {
    const where: any = { id_evaluacion: id };
    
    if (idOrientador) {
      where.id_orientador = idOrientador;
    }

    const evaluacion = await this.prisma.evaluacion.findUnique({
      where: { id_evaluacion: id },
      include: {
        tipoEvaluacion: true,
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
        _count: {
          select: { notas: true },
        },
      },
    });

    if (!evaluacion) {
      throw new NotFoundException(`Evaluación con ID ${id} no encontrada`);
    }

    // Si es orientador, validar que sea suya
    if (idOrientador && evaluacion.id_orientador !== idOrientador) {
      throw new BadRequestException(
        'No tienes permiso para ver esta evaluación',
      );
    }

    return evaluacion;
  }

  /**
   * Actualizar una evaluación
   * @param id - ID de la evaluación
   * @param updateEvaluacionDto - Datos a actualizar
   * @param idOrientador - ID del orientador que actualiza
   */
  async update(
    id: number,
    updateEvaluacionDto: UpdateEvaluacionDto,
    idOrientador: number,
  ) {
    // Verificar que la evaluación existe y pertenece al orientador
    const evaluacionExistente = await this.prisma.evaluacion.findUnique({
      where: { id_evaluacion: id },
    });

    if (!evaluacionExistente) {
      throw new NotFoundException(`Evaluación con ID ${id} no encontrada`);
    }

    if (evaluacionExistente.id_orientador !== idOrientador) {
      throw new BadRequestException(
        'No tienes permiso para actualizar esta evaluación',
      );
    }

    // Si se está actualizando el tipo de evaluación, validar que existe y está activo
    if (updateEvaluacionDto.id_tipo_evaluacion) {
      const tipoEvaluacion = await this.prisma.tipo_evaluacion.findUnique({
        where: { id_tipo_evaluacion: updateEvaluacionDto.id_tipo_evaluacion },
      });

      if (!tipoEvaluacion) {
        throw new NotFoundException(
          `Tipo de evaluación con ID ${updateEvaluacionDto.id_tipo_evaluacion} no encontrado`,
        );
      }

      if (!tipoEvaluacion.activo) {
        throw new BadRequestException(
          `No se puede asignar un tipo de evaluación inactivo`,
        );
      }
    }

    // Si se está actualizando la asignatura, validar que está asignada al orientador
    if (updateEvaluacionDto.id_asignatura) {
      const asignacionOrientador = await this.prisma.asignaturaOrientador.findFirst({
        where: {
          id_asignatura: updateEvaluacionDto.id_asignatura,
          id_orientador: idOrientador,
          activo: true,
        },
      });

      if (!asignacionOrientador) {
        throw new BadRequestException(
          `No tienes asignada esta asignatura o la asignación no está activa`,
        );
      }
    }

    // Validar puntajes si se están actualizando ambos
    const puntajeMinimo =
      updateEvaluacionDto.puntaje_minimo !== undefined
        ? updateEvaluacionDto.puntaje_minimo
        : evaluacionExistente.puntaje_minimo;
    const puntajeMaximo =
      updateEvaluacionDto.puntaje_maximo !== undefined
        ? updateEvaluacionDto.puntaje_maximo
        : evaluacionExistente.puntaje_maximo;

    if (
      puntajeMinimo !== null &&
      puntajeMaximo !== null &&
      puntajeMinimo > puntajeMaximo
    ) {
      throw new BadRequestException(
        'El puntaje mínimo no puede ser mayor que el puntaje máximo',
      );
    }

    // Si se está cambiando el nombre, verificar que no exista otra con el mismo nombre
    if (updateEvaluacionDto.nombre) {
      const idAsignatura =
        updateEvaluacionDto.id_asignatura || evaluacionExistente.id_asignatura;

      const evaluacionConMismoNombre = await this.prisma.evaluacion.findFirst({
        where: {
          nombre: updateEvaluacionDto.nombre,
          id_asignatura: idAsignatura,
          id_orientador: idOrientador,
          id_evaluacion: { not: id },
        },
      });

      if (evaluacionConMismoNombre) {
        throw new ConflictException(
          `Ya existe otra evaluación con el nombre "${updateEvaluacionDto.nombre}" para esta asignatura`,
        );
      }
    }

    // Actualizar la evaluación
    const evaluacionActualizada = await this.prisma.evaluacion.update({
      where: { id_evaluacion: id },
      data: updateEvaluacionDto,
      include: {
        tipoEvaluacion: true,
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
      },
    });

    return {
      message: 'Evaluación actualizada exitosamente',
      evaluacion: evaluacionActualizada,
    };
  }

  /**
   * Eliminar una evaluación
   * @param id - ID de la evaluación
   * @param idOrientador - ID del orientador que elimina
   */
  async remove(id: number, idOrientador: number) {
    // Verificar que la evaluación existe y pertenece al orientador
    const evaluacion = await this.prisma.evaluacion.findUnique({
      where: { id_evaluacion: id },
      include: {
        _count: {
          select: { notas: true },
        },
      },
    });

    if (!evaluacion) {
      throw new NotFoundException(`Evaluación con ID ${id} no encontrada`);
    }

    if (evaluacion.id_orientador !== idOrientador) {
      throw new BadRequestException(
        'No tienes permiso para eliminar esta evaluación',
      );
    }

    // Validar que no tenga notas asociadas
    if (evaluacion._count.notas > 0) {
      throw new ConflictException(
        `No se puede eliminar la evaluación porque tiene ${evaluacion._count.notas} nota(s) asociada(s)`,
      );
    }

    // Eliminar la evaluación
    await this.prisma.evaluacion.delete({
      where: { id_evaluacion: id },
    });

    return {
      message: 'Evaluación eliminada exitosamente',
    };
  }

  /**
   * Obtener historial de evaluaciones con filtros y paginación
   * Para personal administrativo y admin
   * @param filtros - Filtros de búsqueda
   */
  async getHistorial(filtros: FiltrosHistorialDto) {
    const {
      id_tipo_evaluacion,
      nombre,
      fecha_inicio,
      fecha_fin,
      pagina = 1,
      limite = 10,
    } = filtros;

    // Construir el where para los filtros
    const where: any = {};

    if (id_tipo_evaluacion) {
      where.id_tipo_evaluacion = id_tipo_evaluacion;
    }

    if (nombre) {
      where.nombre = {
        contains: nombre,
        mode: 'insensitive',
      };
    }

    // Calcular el total de registros
    const total = await this.prisma.evaluacion.count({ where });

    // Calcular la paginación
    const skip = (pagina - 1) * limite;

    // Obtener las evaluaciones
    const evaluaciones = await this.prisma.evaluacion.findMany({
      where,
      include: {
        tipoEvaluacion: true,
        _count: {
          select: { notas: true },
        },
        notas: {
          select: {
            id_nota: true,
            calificacion: true,
            fecha_registro: true,
            alumno: {
              select: {
                id_alumno: true,
                nombre: true,
                apellido: true,
              },
            },
          },
          orderBy: {
            fecha_registro: 'desc',
          },
          take: 5, // Últimas 5 notas por evaluación
        },
      },
      orderBy: [
        { tipoEvaluacion: { nombre: 'asc' } },
        { nombre: 'asc' },
      ],
      skip,
      take: limite,
    });

    // Calcular estadísticas por evaluación
    const evaluacionesConEstadisticas = await Promise.all(
      evaluaciones.map(async (evaluacion) => {
        const estadisticas = await this.prisma.notas.aggregate({
          where: { id_evaluacion: evaluacion.id_evaluacion },
          _avg: { calificacion: true },
          _max: { calificacion: true },
          _min: { calificacion: true },
        });

        return {
          ...evaluacion,
          estadisticas: {
            promedio: estadisticas._avg?.calificacion?.toFixed(2) || 'N/A',
            notaMaxima: estadisticas._max?.calificacion || 'N/A',
            notaMinima: estadisticas._min?.calificacion || 'N/A',
            totalNotas: evaluacion._count.notas,
          },
        };
      }),
    );

    return {
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
      evaluaciones: evaluacionesConEstadisticas,
    };
  }

  /**
   * Obtener estadísticas generales de evaluaciones
   */
  async getEstadisticasGenerales() {
    const totalEvaluaciones = await this.prisma.evaluacion.count();

    const evaluacionesPorTipo = await this.prisma.tipo_evaluacion.findMany({
      where: { activo: true },
      include: {
        _count: {
          select: { evaluaciones: true },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    const totalNotas = await this.prisma.notas.count();

    const promedioGeneral = await this.prisma.notas.aggregate({
      _avg: { calificacion: true },
    });

    return {
      totalEvaluaciones,
      totalNotas,
      promedioGeneral: promedioGeneral._avg?.calificacion?.toFixed(2) || 'N/A',
      evaluacionesPorTipo: evaluacionesPorTipo.map((tipo) => ({
        id: tipo.id_tipo_evaluacion,
        nombre: tipo.nombre,
        totalEvaluaciones: tipo._count.evaluaciones,
      })),
    };
  }
}
