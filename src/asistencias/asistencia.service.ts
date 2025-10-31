import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { BulkAsistenciaDto } from './dto/bulk-asistencia.dto';

@Injectable()
export class AsistenciaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra la asistencia para múltiples alumnos en una transacción.
   * Utiliza upsert para ser idempotente (evitar duplicados).
   */
  async createBulk(dto: BulkAsistenciaDto) {
    const { registros } = dto;

    const upsertOperations = registros.map((registro) => {
      // Clave única para el upsert
      const where = {
        id_alumno_id_asignatura_fecha: {
          id_alumno: registro.id_alumno,
          id_asignatura: registro.id_asignatura,
          fecha: registro.fecha,
        },
      };

      return this.prisma.asistencia.upsert({
        where: where,
        update: {
          estado: registro.estado,
          observacion: registro.observacion,
          id_orientador: registro.id_orientador, // Actualiza quién lo modificó
        },
        create: registro,
      });
    });

    // Ejecuta todas las operaciones en una sola transacción
    return this.prisma.$transaction(upsertOperations);
  }

  /**
   * Crea un único registro de asistencia (para correcciones).
   */
  async create(dto: CreateAsistenciaDto) {
    return this.prisma.asistencia.create({
      data: dto,
    });
  }

  /**
   * Obtiene todos los registros de asistencia.
   */
  async findAll() {
    return this.prisma.asistencia.findMany({
      orderBy: { fecha: 'desc' },
      include: {
        alumno: { select: { nombre: true, apellido: true } },
        asignatura: { select: { nombre: true } },
      },
    });
  }

  /**
   * Obtiene un registro de asistencia por ID.
   */
  async findOne(id_asistencia: number) {
    const asistencia = await this.prisma.asistencia.findUnique({
      where: { id_asistencia },
      include: {
        alumno: true,
        asignatura: true,
        orientador: true,
      },
    });
    if (!asistencia) {
      throw new NotFoundException(
        `Registro de asistencia con ID ${id_asistencia} no encontrado.`,
      );
    }
    return asistencia;
  }

  /**
   * Obtiene todos los registros de asistencia de un alumno.
   */
  async findByStudent(id_alumno: number) {
    return this.prisma.asistencia.findMany({
      where: { id_alumno },
      orderBy: { fecha: 'desc' },
      include: {
        asignatura: { select: { nombre: true } },
        orientador: { select: { nombre: true, apellido: true } },
      },
    });
  }

  /**
   * Actualiza un único registro de asistencia (para correcciones).
   * Casos de uso comunes:
   * - Cambiar de SP (Sin Permiso) a E (Excusado) cuando traen justificación
   * - Corregir estados incorrectos
   * - Agregar o modificar observaciones
   *
   * NOTA: Esta operación también registra el cambio en AsistenciaHistorial
   * para mantener trazabilidad de todas las modificaciones.
   */
  async update(id_asistencia: number, dto: UpdateAsistenciaDto) {
    // Obtener el registro actual antes de actualizarlo
    const asistenciaActual = await this.findOne(id_asistencia);

    // Actualizar el registro
    const asistenciaActualizada = await this.prisma.asistencia.update({
      where: { id_asistencia },
      data: dto,
    });

    // Registrar el cambio en el historial (para auditoría)
    await this.prisma.asistenciaHistorial.create({
      data: {
        id_asistencia: id_asistencia,
        id_alumno: asistenciaActual.id_alumno,
        id_asignatura: asistenciaActual.id_asignatura,
        fecha: asistenciaActual.fecha,
        accion: 'UPDATE',
        id_orientador_registro:
          dto.id_orientador ?? asistenciaActual.id_orientador,
        estado_anterior: asistenciaActual.estado,
        estado_nuevo: dto.estado ?? asistenciaActual.estado,
        observ_anterior: asistenciaActual.observacion,
        observ_nueva: dto.observacion ?? asistenciaActual.observacion,
      },
    });

    return asistenciaActualizada;
  }

  /**
   * Elimina un único registro de asistencia.
   */
  async remove(id_asistencia: number) {
    await this.findOne(id_asistencia); // Verifica que exista
    return this.prisma.asistencia.delete({
      where: { id_asistencia },
    });
  }

  /**
   * Busca asistencias con filtros avanzados para el historial.
   * Útil para encontrar registros que necesitan ser modificados.
   */
  async findWithFilters(filters: {
    cursoId?: number;
    alumnoId?: number;
    fecha?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    estado?: string;
  }) {
    const where: any = {};

    if (filters.alumnoId) {
      where.id_alumno = filters.alumnoId;
    }

    if (filters.fecha) {
      where.fecha = filters.fecha;
    }

    if (filters.fechaDesde || filters.fechaHasta) {
      where.fecha = {};
      if (filters.fechaDesde) {
        where.fecha.gte = filters.fechaDesde;
      }
      if (filters.fechaHasta) {
        where.fecha.lte = filters.fechaHasta;
      }
    }

    if (filters.estado) {
      where.estado = filters.estado;
    }

    // Si se filtró por curso, necesitamos obtener los alumnos del curso
    if (filters.cursoId) {
      const alumnos = await this.prisma.alumnoCurso.findMany({
        where: {
          cursoId: filters.cursoId,
          estado: 'ACTIVO',
        },
        select: { alumnoId: true },
      });
      const alumnoIds = alumnos.map((a) => a.alumnoId);
      where.id_alumno = { in: alumnoIds };
    }

    return this.prisma.asistencia.findMany({
      where,
      orderBy: { fecha: 'desc' },
      include: {
        alumno: { select: { nombre: true, apellido: true } },
        asignatura: { select: { nombre: true } },
        orientador: { select: { nombre: true, apellido: true } },
      },
      take: 100, // Limitar resultados para evitar sobrecarga
    });
  }

  /**
   * Obtiene el historial de cambios de un registro de asistencia.
   * Muestra todas las modificaciones que se han hecho sobre ese registro.
   */
  async getHistorial(id_asistencia: number) {
    return this.prisma.asistenciaHistorial.findMany({
      where: { id_asistencia },
      orderBy: { creadoEn: 'desc' },
    });
  }

  /**
   * Obtiene el historial de cambios de un alumno en un rango de fechas.
   */
  async getHistorialAlumno(
    id_alumno: number,
    fechaDesde?: string,
    fechaHasta?: string,
  ) {
    const where: any = { id_alumno };

    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) {
        where.fecha.gte = fechaDesde;
      }
      if (fechaHasta) {
        where.fecha.lte = fechaHasta;
      }
    }

    return this.prisma.asistenciaHistorial.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
    });
  }
}
