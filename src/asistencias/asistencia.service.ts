import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { BulkAsistenciaDto } from './dto/bulk-asistencia.dto';
import { Prisma } from '@prisma/client';
import { calcularTrimestre, obtenerAnioAcademico } from './utils/fecha-helpers';

@Injectable()
export class AsistenciaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra la asistencia para múltiples alumnos en una transacción.
   * Utiliza upsert para ser idempotente (evitar duplicados).
   * ✅ ACTUALIZADO: Ahora soporta asistencia por curso (sin asignatura obligatoria)
   */
  async createBulk(dto: BulkAsistenciaDto) {
    const { registros } = dto;

    const upsertOperations = registros.map((registro) => {
      // ✅ CAMBIO: Clave única ahora es solo alumno + fecha (asistencia por curso)

      // ✅ Calcular automáticamente trimestre y año si no vienen
      const anioAcademico =
        registro.anio_academico || obtenerAnioAcademico(registro.fecha);
      const trimestre = registro.trimestre || calcularTrimestre(registro.fecha);

      // ✅ Preparar data para create/update (manejar id_asignatura opcional)
      const createData: any = {
        id_alumno: registro.id_alumno,
        fecha: registro.fecha,
        estado: registro.estado,
        observacion: registro.observacion,
        id_orientador: registro.id_orientador,
        anio_academico: anioAcademico,
        trimestre: trimestre,
      };

      const updateData: any = {
        estado: registro.estado,
        observacion: registro.observacion,
        id_orientador: registro.id_orientador,
        anio_academico: anioAcademico,
        trimestre: trimestre,
      };

      // Solo agregar id_asignatura si viene en el request
      if (registro.id_asignatura !== undefined) {
        createData.id_asignatura = registro.id_asignatura;
        updateData.id_asignatura = registro.id_asignatura;
      }

      return this.prisma.asistencia.upsert({
        where: {
          id_alumno_fecha: {
            id_alumno: registro.id_alumno,
            fecha: registro.fecha,
          },
        },
        update: updateData,
        create: createData,
      });
    });

    // Ejecuta todas las operaciones en una sola transacción
    return this.prisma.$transaction(upsertOperations);
  }

  /**
   * Crea un único registro de asistencia (para correcciones).
   * ✅ ACTUALIZADO: Maneja id_asignatura opcional
   */
  async create(dto: CreateAsistenciaDto) {
    // ✅ Calcular automáticamente trimestre y año si no vienen
    const anioAcademico = dto.anio_academico || obtenerAnioAcademico(dto.fecha);
    const trimestre = dto.trimestre || calcularTrimestre(dto.fecha);

    // ✅ Preparar data (manejar id_asignatura opcional)
    const data: any = {
      id_alumno: dto.id_alumno,
      fecha: dto.fecha,
      estado: dto.estado,
      observacion: dto.observacion,
      id_orientador: dto.id_orientador,
      anio_academico: anioAcademico,
      trimestre: trimestre,
    };

    // Solo agregar id_asignatura si viene en el request
    if (dto.id_asignatura !== undefined) {
      data.id_asignatura = dto.id_asignatura;
    }

    return this.prisma.asistencia.create({
      data,
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

    // Convertir fecha string a DateTime ISO-8601
    if (filters.fecha) {
      // Si viene solo la fecha (YYYY-MM-DD), convertir a rango de ese día completo
      const fechaInicio = new Date(filters.fecha);
      fechaInicio.setHours(0, 0, 0, 0);

      const fechaFin = new Date(filters.fecha);
      fechaFin.setHours(23, 59, 59, 999);

      where.fecha = {
        gte: fechaInicio.toISOString(),
        lte: fechaFin.toISOString(),
      };
    }

    // Convertir rango de fechas a DateTime ISO-8601
    if (filters.fechaDesde || filters.fechaHasta) {
      where.fecha = {};
      if (filters.fechaDesde) {
        const fechaDesde = new Date(filters.fechaDesde);
        fechaDesde.setHours(0, 0, 0, 0);
        where.fecha.gte = fechaDesde.toISOString();
      }
      if (filters.fechaHasta) {
        const fechaHasta = new Date(filters.fechaHasta);
        fechaHasta.setHours(23, 59, 59, 999);
        where.fecha.lte = fechaHasta.toISOString();
      }
    }

    if (filters.estado) {
      where.estado = filters.estado;
    }

    // Si se filtró por curso, necesitamos obtener los alumnos del curso
    if (filters.cursoId) {
      try {
        const alumnos = await this.prisma.alumnoCurso.findMany({
          where: {
            cursoId: filters.cursoId,
            estado: 'ACTIVO', // ✅ Según schema, este campo es String
          },
          select: { alumnoId: true },
        });

        console.log(
          `🔍 Alumnos encontrados en curso ${filters.cursoId}:`,
          alumnos.length,
        );

        if (alumnos.length === 0) {
          // No hay alumnos inscritos en este curso, retornar array vacío
          console.log(
            `⚠️ No hay alumnos activos en el curso ${filters.cursoId}`,
          );
          return [];
        }

        const alumnoIds = alumnos.map((a) => a.alumnoId);
        where.id_alumno = { in: alumnoIds };
      } catch (error) {
        console.error('❌ Error al buscar alumnos del curso:', error);
        throw new Error(`Error al buscar alumnos del curso: ${error.message}`);
      }
    }

    try {
      const asistencias = await this.prisma.asistencia.findMany({
        where,
        orderBy: { fecha: 'desc' },
        include: {
          alumno: { select: { nombre: true, apellido: true } },
          asignatura: { select: { nombre: true } },
          orientador: { select: { nombre: true, apellido: true } },
        },
        take: 100,
      });

      console.log(`✅ Asistencias encontradas: ${asistencias.length}`);
      return asistencias;
    } catch (error) {
      console.error('❌ Error al buscar asistencias:', error);
      throw new Error(`Error al buscar asistencias: ${error.message}`);
    }
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

    // Convertir fechas string a DateTime ISO-8601
    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) {
        const fechaDesdeDate = new Date(fechaDesde);
        fechaDesdeDate.setHours(0, 0, 0, 0);
        where.fecha.gte = fechaDesdeDate.toISOString();
      }
      if (fechaHasta) {
        const fechaHastaDate = new Date(fechaHasta);
        fechaHastaDate.setHours(23, 59, 59, 999);
        where.fecha.lte = fechaHastaDate.toISOString();
      }
    }

    return this.prisma.asistenciaHistorial.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
    });
  }

  /**
   * Verifica si un alumno tiene asistencia registrada en una fecha específica
   * y retorna su estado si existe.
   */
  async verificarEstadoAlumno(id_alumno: number, fecha: string) {
    // Convertir fecha string a rango del día completo en DateTime ISO-8601
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);

    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    const asistencia = await this.prisma.asistencia.findFirst({
      where: {
        id_alumno,
        fecha: {
          gte: fechaInicio.toISOString(),
          lte: fechaFin.toISOString(),
        },
      },
      select: {
        id_asistencia: true,
        estado: true,
        observacion: true,
      },
    });

    return asistencia;
  }
}
