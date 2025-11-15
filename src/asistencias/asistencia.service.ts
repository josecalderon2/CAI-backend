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
        const fechaDesdeDate = new Date(filters.fechaDesde);
        fechaDesdeDate.setHours(0, 0, 0, 0);
        where.fecha.gte = fechaDesdeDate.toISOString();
      }
      if (filters.fechaHasta) {
        const fechaHastaDate = new Date(filters.fechaHasta);
        fechaHastaDate.setHours(23, 59, 59, 999);
        where.fecha.lte = fechaHastaDate.toISOString();
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

      return asistencias;
    } catch (error) {
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

  /**
   * Resumen trimestral consolidado por curso y año académico
   * - Cuenta estados P, E, SP, A por trimestre
   * - Calcula porcentaje_asistencia = (P + E) / total * 100
   * - Incluye detalle por alumno con su asistencia en cada trimestre
   */
  async resumenTrimestralConsolidado(cursoId: number, anio: string) {
    // Obtener alumnos activos del curso para el año solicitado
    const alumnosCurso = await this.prisma.alumnoCurso.findMany({
      where: { cursoId, anioAcademico: anio, estado: 'ACTIVO' },
      select: {
        alumnoId: true,
        alumno: {
          select: {
            id_alumno: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    const alumnoIds = alumnosCurso.map((a) => a.alumnoId);

    // Estructura base para 3 trimestres
    const base = () => ({
      P: 0,
      E: 0,
      SP: 0,
      A: 0,
      total_registros: 0,
      porcentaje_asistencia: 0,
    });
    const trimestres: Record<number, any> = { 1: base(), 2: base(), 3: base() };

    if (alumnoIds.length === 0) {
      // Sin alumnos: retornar estructura vacía
      return {
        cursoId,
        anio,
        trimestres: [
          { trimestre: 1, ...trimestres[1], alumnos: [] },
          { trimestre: 2, ...trimestres[2], alumnos: [] },
          { trimestre: 3, ...trimestres[3], alumnos: [] },
        ],
        totales: {
          P: 0,
          E: 0,
          SP: 0,
          A: 0,
          total_registros: 0,
          porcentaje_asistencia: 0,
        },
      };
    }

    // Obtener todas las asistencias del curso para el año
    const asistencias = await this.prisma.asistencia.findMany({
      where: {
        id_alumno: { in: alumnoIds },
        anio_academico: anio,
      },
      select: {
        id_alumno: true,
        trimestre: true,
        estado: true,
        fecha: true,
        observacion: true,
      },
      orderBy: [{ id_alumno: 'asc' }, { trimestre: 'asc' }, { fecha: 'asc' }],
    });

    // Agrupar por trimestre y estado para totales
    const grouped = await this.prisma.asistencia.groupBy({
      by: ['trimestre', 'estado'],
      where: {
        id_alumno: { in: alumnoIds },
        anio_academico: anio,
      },
      _count: { _all: true },
    });

    // Volcar resultados en la estructura de totales
    for (const row of grouped) {
      const t = (row.trimestre ?? 0) as number;
      if (![1, 2, 3].includes(t)) continue; // Solo trimestres válidos
      const estado = row.estado as unknown as 'P' | 'E' | 'SP' | 'A';
      const count = (row as any)._count._all as number;

      trimestres[t][estado] = (trimestres[t][estado] || 0) + count;
    }

    // Agrupar asistencias por alumno y trimestre
    const alumnosMap = new Map<number, any>();
    alumnosCurso.forEach((ac) => {
      alumnosMap.set(ac.alumnoId, {
        id_alumno: ac.alumno.id_alumno,
        nombre: ac.alumno.nombre,
        apellido: ac.alumno.apellido,
        trimestres: {
          1: {
            P: 0,
            E: 0,
            SP: 0,
            A: 0,
            total_registros: 0,
            porcentaje_asistencia: 0,
          },
          2: {
            P: 0,
            E: 0,
            SP: 0,
            A: 0,
            total_registros: 0,
            porcentaje_asistencia: 0,
          },
          3: {
            P: 0,
            E: 0,
            SP: 0,
            A: 0,
            total_registros: 0,
            porcentaje_asistencia: 0,
          },
        },
      });
    });

    // Contar asistencias por alumno y trimestre
    for (const asis of asistencias) {
      const t = (asis.trimestre ?? 0) as number;
      if (![1, 2, 3].includes(t)) continue;

      const alumnoData = alumnosMap.get(asis.id_alumno);
      if (!alumnoData) continue;

      const estado = asis.estado as 'P' | 'E' | 'SP' | 'A';
      alumnoData.trimestres[t][estado]++;
    }

    // Calcular porcentajes por alumno y trimestre
    alumnosMap.forEach((alumnoData) => {
      [1, 2, 3].forEach((t) => {
        const tr = alumnoData.trimestres[t];
        tr.total_registros = tr.P + tr.E + tr.SP + tr.A;
        tr.porcentaje_asistencia =
          tr.total_registros > 0
            ? Number((((tr.P + tr.E) / tr.total_registros) * 100).toFixed(2))
            : 0;
      });
    });

    // Calcular totales por trimestre y porcentaje con detalle de alumnos
    const resumenTrimestres = [1, 2, 3].map((t) => {
      const data = trimestres[t];
      const total = data.P + data.E + data.SP + data.A;
      const porcentaje =
        total > 0 ? Number((((data.P + data.E) / total) * 100).toFixed(2)) : 0;

      // Obtener alumnos de este trimestre
      const alumnosDetalle = Array.from(alumnosMap.values()).map((alumno) => ({
        id_alumno: alumno.id_alumno,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        P: alumno.trimestres[t].P,
        E: alumno.trimestres[t].E,
        SP: alumno.trimestres[t].SP,
        A: alumno.trimestres[t].A,
        total_registros: alumno.trimestres[t].total_registros,
        porcentaje_asistencia: alumno.trimestres[t].porcentaje_asistencia,
      }));

      return {
        trimestre: t,
        P: data.P,
        E: data.E,
        SP: data.SP,
        A: data.A,
        total_registros: total,
        porcentaje_asistencia: porcentaje,
        alumnos: alumnosDetalle,
      };
    });

    // Totales generales
    const totales = resumenTrimestres.reduce(
      (acc, it) => {
        acc.P += it.P;
        acc.E += it.E;
        acc.SP += it.SP;
        acc.A += it.A;
        acc.total_registros += it.total_registros;
        return acc;
      },
      { P: 0, E: 0, SP: 0, A: 0, total_registros: 0 },
    );
    const porcentajeGeneral =
      totales.total_registros > 0
        ? Number(
            (((totales.P + totales.E) / totales.total_registros) * 100).toFixed(
              2,
            ),
          )
        : 0;

    return {
      cursoId,
      anio,
      trimestres: resumenTrimestres,
      totales: { ...totales, porcentaje_asistencia: porcentajeGeneral },
    };
  }

  /**
   * Resumen trimestral consolidado por alumno (asistencia + conducta)
   * - Valida que el alumno pertenezca al curso en el año indicado
   * - Asistencia: agrupa por trimestre y estado (P,E,SP,A)
   * - Conducta: agrupa por trimestre y categoría (MENOS_GRAVE, GRAVE, MUY_GRAVE)
   */
  async resumenTrimestralConsolidadoAlumno(
    cursoId: number,
    alumnoId: number,
    anio: string,
  ) {
    // Verificar inscripción activa del alumno en el curso/año
    const insc = await this.prisma.alumnoCurso.findFirst({
      where: {
        cursoId,
        alumnoId,
        anioAcademico: anio,
        estado: 'ACTIVO',
      },
    });
    if (!insc) {
      throw new NotFoundException(
        `El alumno ${alumnoId} no está activo en el curso ${cursoId} para el año ${anio}`,
      );
    }

    // Datos básicos del alumno
    const alumno = await this.prisma.alumno.findUnique({
      where: { id_alumno: alumnoId },
      select: { id_alumno: true, nombre: true, apellido: true },
    });

    // ===== Asistencia por trimestre =====
    const baseAsis = () => ({
      P: 0,
      E: 0,
      SP: 0,
      A: 0,
      total_registros: 0,
      porcentaje_asistencia: 0,
    });
    const asis: Record<number, any> = {
      1: baseAsis(),
      2: baseAsis(),
      3: baseAsis(),
    };

    const asisGrouped = await this.prisma.asistencia.groupBy({
      by: ['trimestre', 'estado'],
      where: { id_alumno: alumnoId, anio_academico: anio },
      _count: { _all: true },
    });
    for (const row of asisGrouped) {
      const t = (row.trimestre ?? 0) as number;
      if (![1, 2, 3].includes(t)) continue;
      const estado = row.estado as unknown as 'P' | 'E' | 'SP' | 'A';
      const count = (row as any)._count._all as number;
      asis[t][estado] = (asis[t][estado] || 0) + count;
    }
    const asisTrimestres = [1, 2, 3].map((t) => {
      const d = asis[t];
      const total = d.P + d.E + d.SP + d.A;
      const porc =
        total > 0 ? Number((((d.P + d.E) / total) * 100).toFixed(2)) : 0;
      return {
        trimestre: t,
        P: d.P,
        E: d.E,
        SP: d.SP,
        A: d.A,
        total_registros: total,
        porcentaje_asistencia: porc,
      };
    });
    const asisTotales = asisTrimestres.reduce(
      (acc, it) => {
        acc.P += it.P;
        acc.E += it.E;
        acc.SP += it.SP;
        acc.A += it.A;
        acc.total_registros += it.total_registros;
        return acc;
      },
      { P: 0, E: 0, SP: 0, A: 0, total_registros: 0 },
    );
    const asisPorcGeneral =
      asisTotales.total_registros > 0
        ? Number(
            (
              ((asisTotales.P + asisTotales.E) / asisTotales.total_registros) *
              100
            ).toFixed(2),
          )
        : 0;

    // ===== Conducta por trimestre =====
    const baseCond = () => ({
      MENOS_GRAVE: 0,
      GRAVE: 0,
      MUY_GRAVE: 0,
      puntos: 0,
      detalles: [] as any[],
    });
    const cond: Record<number, any> = {
      1: baseCond(),
      2: baseCond(),
      3: baseCond(),
    };

    const conductas = await this.prisma.conducta.findMany({
      where: { id_alumno: alumnoId, anio_academico: anio },
      select: {
        trimestre: true,
        infraccion: {
          select: {
            categoria: true,
            puntos: true,
            articulo: true,
            descripcion: true,
          },
        },
      },
      orderBy: { fecha: 'asc' },
    });

    // Agrupar manualmente por trimestre y categoría; acumular puntos; recolectar detalles por artículo
    const detalleKey = (x: any) =>
      `${x.infraccion.articulo}|${x.infraccion.descripcion}|${x.infraccion.categoria}`;
    const detalleMaps: Record<
      number,
      Map<
        string,
        {
          categoria: string;
          articulo: string;
          descripcion: string;
          conteo: number;
        }
      >
    > = {
      1: new Map(),
      2: new Map(),
      3: new Map(),
    };
    for (const c of conductas) {
      const t = (c.trimestre ?? 0) as number;
      if (![1, 2, 3].includes(t)) continue;
      const cat = c.infraccion.categoria as
        | 'MENOS_GRAVE'
        | 'GRAVE'
        | 'MUY_GRAVE';
      cond[t][cat] = (cond[t][cat] || 0) + 1;
      cond[t].puntos += c.infraccion.puntos || 0;

      const key = detalleKey(c);
      const m = detalleMaps[t];
      if (!m.has(key)) {
        m.set(key, {
          categoria: c.infraccion.categoria,
          articulo: c.infraccion.articulo,
          descripcion: c.infraccion.descripcion,
          conteo: 1,
        });
      } else {
        const curr = m.get(key)!;
        curr.conteo += 1;
      }
    }
    // Materializar detalles
    [1, 2, 3].forEach((t) => {
      cond[t].detalles = Array.from(detalleMaps[t].values());
    });

    const condTrimestres = [1, 2, 3].map((t) => ({
      trimestre: t,
      menos_graves: cond[t].MENOS_GRAVE,
      graves: cond[t].GRAVE,
      muy_graves: cond[t].MUY_GRAVE,
      puntos: Number((cond[t].puntos || 0).toFixed(2)),
      detalles: cond[t].detalles,
    }));
    const condTotales = condTrimestres.reduce(
      (acc, it) => {
        acc.menos_graves += it.menos_graves;
        acc.graves += it.graves;
        acc.muy_graves += it.muy_graves;
        acc.puntos += it.puntos;
        return acc;
      },
      { menos_graves: 0, graves: 0, muy_graves: 0, puntos: 0 },
    );
    condTotales.puntos = Number(condTotales.puntos.toFixed(2));

    return {
      cursoId,
      anio,
      alumno,
      asistencia: {
        trimestres: asisTrimestres,
        totales: { ...asisTotales, porcentaje_asistencia: asisPorcGeneral },
      },
      conducta: {
        trimestres: condTrimestres,
        totales: condTotales,
      },
    };
  }
}
