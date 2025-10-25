import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAsistenciaDto,
  UpdateAsistenciaDto,
  AsistenciaResponse,
} from './dto';
import { AccionAsistencia } from '@prisma/client';
import { buildAsistenciaHistorialInput } from './utils/asistencia-history.util';

@Injectable()
export class AsistenciaService {
  constructor(private prisma: PrismaService) {}

  // Crear o actualizar asistencias (individual o bloque)
  async create(
    createAsistenciaDto: CreateAsistenciaDto[],
  ): Promise<AsistenciaResponse[]> {
    const resultados: AsistenciaResponse[] = [];

    for (const asistencia of createAsistenciaDto) {
      const {
        id_alumno,
        id_asignatura,
        id_orientador,
        fecha,
        estado,
        observacion,
        anio_academico,
        trimestre,
      } = asistencia;

      // 1) Validaciones (igual que las tienes)
      const asignaturaExiste = await this.prisma.asignatura.findUnique({
        where: { id_asignatura },
      });
      if (!asignaturaExiste) {
        throw new NotFoundException(
          `La asignatura con ID ${id_asignatura} no existe.`,
        );
      }

      const docenteAsignado = await this.prisma.asignaturaOrientador.findFirst({
        where: { id_asignatura, id_orientador, activo: true },
      });
      if (!docenteAsignado) {
        throw new ConflictException(
          `El docente con ID ${id_orientador} no está asignado a la asignatura ${id_asignatura}.`,
        );
      }

      // 2) Obtenemos "before" por la clave única
      const clave = {
        id_alumno_id_asignatura_fecha: {
          id_alumno,
          id_asignatura,
          fecha: new Date(fecha),
        },
      };
      const before = await this.prisma.asistencia.findUnique({ where: clave });

      // 3) Transacción: upsert + historial
      const registro = await this.prisma.$transaction(async (tx) => {
        const upserted = await tx.asistencia.upsert({
          where: clave,
          update: { estado, observacion, anio_academico, trimestre },
          create: {
            id_alumno,
            id_asignatura,
            id_orientador,
            fecha: new Date(fecha),
            estado,
            observacion,
            anio_academico,
            trimestre,
          },
          include: {
            alumno: {
              select: { id_alumno: true, nombre: true, apellido: true },
            },
            asignatura: { select: { id_asignatura: true, nombre: true } },
            orientador: {
              select: { id_orientador: true, nombre: true, apellido: true },
            },
          },
        });

        // 4) Historial
        await tx.asistenciaHistorial.create({
          data: buildAsistenciaHistorialInput({
            accion: before ? AccionAsistencia.UPDATE : AccionAsistencia.CREATE,
            before: before
              ? {
                  id_asistencia: before.id_asistencia,
                  id_alumno: before.id_alumno,
                  id_asignatura: before.id_asignatura,
                  fecha: before.fecha,
                  estado: before.estado,
                  observacion: before.observacion ?? null,
                }
              : null,
            after: {
              id_asistencia: upserted.id_asistencia,
              id_alumno: upserted.id_alumno,
              id_asignatura: upserted.id_asignatura,
              fecha: upserted.fecha,
              estado: upserted.estado,
              observacion: upserted.observacion ?? null,
            },
            id_orientador_registro: id_orientador, // el que hizo la acción
          }),
        });

        return upserted;
      });

      resultados.push(registro as unknown as AsistenciaResponse);
    }

    return resultados;
  }

  // Obtener asistencias por asignatura y fecha específica
  async findByAsignaturaAndFecha(
    id_asignatura: number,
    fecha: string,
  ): Promise<AsistenciaResponse[]> {
    const asignaturaExiste = await this.prisma.asignatura.findUnique({
      where: { id_asignatura },
    });
    if (!asignaturaExiste) {
      throw new NotFoundException(
        `La asignatura con ID ${id_asignatura} no existe.`,
      );
    }

    return this.prisma.asistencia.findMany({
      where: {
        id_asignatura,
        fecha: new Date(fecha),
      },
      include: {
        alumno: { select: { id_alumno: true, nombre: true, apellido: true } },
        asignatura: { select: { id_asignatura: true, nombre: true } },
        orientador: {
          select: { id_orientador: true, nombre: true, apellido: true },
        },
      },
      orderBy: { id_alumno: 'asc' },
    }) as unknown as AsistenciaResponse[];
  }

  // Obtener asistencias por docente (orientador)
  async findByDocente(id_orientador: number): Promise<AsistenciaResponse[]> {
    const asistencias = await this.prisma.asistencia.findMany({
      where: { id_orientador },
      include: {
        alumno: { select: { id_alumno: true, nombre: true, apellido: true } },
        asignatura: {
          select: { id_asignatura: true, nombre: true, id_curso: true },
        },
      },
      orderBy: [{ fecha: 'desc' }, { id_asignatura: 'asc' }],
    });

    if (!asistencias.length) {
      throw new NotFoundException(
        `El docente con ID ${id_orientador} no tiene asistencias registradas.`,
      );
    }

    return asistencias as unknown as AsistenciaResponse[];
  }

  // Obtener historial de asistencias de un alumno
  async findByAlumno(id_alumno: number): Promise<AsistenciaResponse[]> {
    const asistencias = await this.prisma.asistencia.findMany({
      where: { id_alumno },
      include: {
        asignatura: {
          select: { id_asignatura: true, nombre: true, id_curso: true },
        },
        orientador: {
          select: { id_orientador: true, nombre: true, apellido: true },
        },
      },
      orderBy: [{ fecha: 'desc' }, { id_asignatura: 'asc' }],
    });

    if (!asistencias.length) {
      throw new NotFoundException(
        `El alumno con ID ${id_alumno} no tiene asistencias registradas.`,
      );
    }

    return asistencias as unknown as AsistenciaResponse[];
  }

  // Actualizar asistencia
  async update(
    id_asistencia: number,
    dto: UpdateAsistenciaDto,
  ): Promise<AsistenciaResponse> {
    try {
      const before = await this.prisma.asistencia.findUnique({
        where: { id_asistencia },
      });
      if (!before) {
        throw new NotFoundException(
          `La asistencia con ID ${id_asistencia} no fue encontrada.`,
        );
      }

      const updated = await this.prisma.$transaction(async (tx) => {
        const asistenciaActualizada = await tx.asistencia.update({
          where: { id_asistencia },
          data: {
            ...(dto.estado && { estado: dto.estado }),
            ...(dto.observacion && { observacion: dto.observacion }),
            ...(dto.trimestre && { trimestre: dto.trimestre }),
          },
          include: {
            alumno: {
              select: { id_alumno: true, nombre: true, apellido: true },
            },
            asignatura: { select: { id_asignatura: true, nombre: true } },
            orientador: {
              select: { id_orientador: true, nombre: true, apellido: true },
            },
          },
        });

        await tx.asistenciaHistorial.create({
          data: buildAsistenciaHistorialInput({
            accion: AccionAsistencia.UPDATE,
            before: {
              id_asistencia: before.id_asistencia,
              id_alumno: before.id_alumno,
              id_asignatura: before.id_asignatura,
              fecha: before.fecha,
              estado: before.estado,
              observacion: before.observacion ?? null,
            },
            after: {
              id_asistencia: asistenciaActualizada.id_asistencia,
              id_alumno: asistenciaActualizada.id_alumno,
              id_asignatura: asistenciaActualizada.id_asignatura,
              fecha: asistenciaActualizada.fecha,
              estado: asistenciaActualizada.estado,
              observacion: asistenciaActualizada.observacion ?? null,
            },
            // Si en tu flujo el actor es el orientador “dueño” del registro, puedes usar:
            id_orientador_registro: asistenciaActualizada.id_orientador,
          }),
        });

        return asistenciaActualizada;
      });

      return updated as unknown as AsistenciaResponse;
    } catch (error: any) {
      console.error('❌ Error en update:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // src/asistencias/asistencias.service.ts
  async getConsolidadoMensual(id_curso: number, anio: number, mes: number) {
    const inicioMes = new Date(anio, mes - 1, 1);
    const finMes = new Date(anio, mes, 0);

    // 1) Asignaturas del curso
    const asignaturas = await this.prisma.asignatura.findMany({
      where: { id_curso },
      select: { id_asignatura: true, nombre: true },
    });
    if (!asignaturas.length)
      throw new NotFoundException(`El curso ${id_curso} no tiene asignaturas.`);

    // 2) Asistencias del mes
    const asistencias = await this.prisma.asistencia.findMany({
      where: {
        id_asignatura: { in: asignaturas.map((a) => a.id_asignatura) },
        fecha: {
          gte: inicioMes,
          lte: new Date(
            finMes.getFullYear(),
            finMes.getMonth(),
            finMes.getDate(),
            23,
            59,
            59,
            999,
          ),
        },
      },
      include: {
        alumno: { select: { id_alumno: true, nombre: true, apellido: true } },
        asignatura: { select: { id_asignatura: true, nombre: true } },
      },
    });
    if (!asistencias.length)
      throw new NotFoundException(`No hay asistencias para ${mes}/${anio}.`);

    // 3) Agrupar como la hoja: PRESENTES = P + E, SP por separado
    const consolidado: Record<number, any> = {}; // id_asignatura -> { asignatura, alumnos: { id: {...} } }

    for (const a of asistencias) {
      const idAsig = a.asignatura.id_asignatura;
      const idAlumno = a.alumno.id_alumno;
      const estado = (a.estado || '').toUpperCase().trim(); // 'P', 'E', 'SP', 'A'

      if (!consolidado[idAsig]) {
        consolidado[idAsig] = { asignatura: a.asignatura.nombre, alumnos: {} };
      }
      if (!consolidado[idAsig].alumnos[idAlumno]) {
        consolidado[idAsig].alumnos[idAlumno] = {
          alumno: a.alumno,
          presentes: 0,
          sin_permiso: 0,
        };
      }

      // EXACTO como la planilla
      if (estado === 'P' || estado === 'E') {
        consolidado[idAsig].alumnos[idAlumno].presentes += 1;
      } else if (estado === 'SP') {
        consolidado[idAsig].alumnos[idAlumno].sin_permiso += 1;
      }
      // 'A' no se usa en Consolidados de la hoja
    }

    // 4) Formato plano + orden
    const resultado: {
      id_asignatura: number;
      nombre_asignatura: string;
      id_alumno: number;
      nombre_alumno: string;
      apellido_alumno: string;
      presentes: number;
      sin_permiso: number;
    }[] = [];

    for (const [idAsig, datosAsig] of Object.entries(consolidado) as [
      string,
      any,
    ][]) {
      for (const [idAlumno, datosAlum] of Object.entries(datosAsig.alumnos) as [
        string,
        any,
      ][]) {
        resultado.push({
          id_asignatura: Number(idAsig),
          nombre_asignatura: datosAsig.asignatura,
          id_alumno: Number(idAlumno),
          nombre_alumno: datosAlum.alumno.nombre,
          apellido_alumno: datosAlum.alumno.apellido,
          presentes: datosAlum.presentes,
          sin_permiso: datosAlum.sin_permiso,
        });
      }
    }

    resultado.sort(
      (a, b) =>
        a.nombre_asignatura.localeCompare(b.nombre_asignatura) ||
        a.nombre_alumno.localeCompare(b.nombre_alumno),
    );

    return resultado;
  }

  // src/asistencias/asistencias.service.ts
  async getConsolidadoTrimestral(
    id_curso: number,
    anio: number,
    trimestre: number,
  ) {
    const trimestres = {
      1: [1, 2, 3],
      2: [4, 5, 6],
      3: [7, 8, 9],
      4: [10, 11, 12],
    } as const;

    const meses = trimestres[trimestre];
    if (!meses)
      throw new BadRequestException(
        `Trimestre ${trimestre} inválido. Debe estar entre 1 y 4.`,
      );

    const inicio = new Date(anio, meses[0] - 1, 1);
    const fin = new Date(anio, meses[2], 0, 23, 59, 59, 999);

    // 1) Asignaturas del curso
    const asignaturas = await this.prisma.asignatura.findMany({
      where: { id_curso },
      select: { id_asignatura: true, nombre: true },
    });
    if (!asignaturas.length)
      throw new NotFoundException(`El curso ${id_curso} no tiene asignaturas.`);

    const asignIds = asignaturas.map((a) => a.id_asignatura);

    // 2) Asistencias del trimestre (para SP totales)
    const asistencias = await this.prisma.asistencia.findMany({
      where: {
        id_asignatura: { in: asignIds },
        fecha: { gte: inicio, lte: fin },
      },
      include: {
        alumno: { select: { id_alumno: true, nombre: true, apellido: true } },
        asignatura: { select: { id_asignatura: true, nombre: true } },
      },
    });
    if (!asistencias.length)
      throw new NotFoundException(
        `No hay asistencias registradas en el trimestre ${trimestre}/${anio}.`,
      );

    // 3) Conductas del trimestre (para faltas Menos Graves / Graves / Muy Graves)
    const conductas = await this.prisma.conducta.findMany({
      where: {
        fecha: { gte: inicio, lte: fin },
        id_asignatura: { in: asignIds },
      },
      select: {
        id_alumno: true,
        gravedad: true, // 'MENOS_GRAVE' | 'GRAVE' | 'MUY_GRAVE'
      },
    });

    // 4) Agregar por asignatura y alumno
    type Row = {
      alumno: { id_alumno: number; nombre: string; apellido: string };
      presentes: number;
      sp: number; // sin permiso
      menos_graves: number;
      graves: number;
      muy_graves: number;
    };
    const acc: Record<
      number,
      { asignatura: string; alumnos: Record<number, Row> }
    > = {};

    for (const a of asistencias) {
      const idAsig = a.asignatura.id_asignatura;
      const idAlumno = a.alumno.id_alumno;
      const estado = (a.estado || '').toUpperCase().trim();

      if (!acc[idAsig])
        acc[idAsig] = { asignatura: a.asignatura.nombre, alumnos: {} };
      if (!acc[idAsig].alumnos[idAlumno]) {
        acc[idAsig].alumnos[idAlumno] = {
          alumno: a.alumno,
          presentes: 0,
          sp: 0,
          menos_graves: 0,
          graves: 0,
          muy_graves: 0,
        };
      }

      // EXACTO como la hoja (trimestral suma de los 3 meses):
      // Presentes = P + E (igual que Consolidados)
      if (estado === 'P' || estado === 'E')
        acc[idAsig].alumnos[idAlumno].presentes += 1;
      else if (estado === 'SP') acc[idAsig].alumnos[idAlumno].sp += 1;
    }

    // Sumar conductas por alumno
    for (const c of conductas) {
      // Se suma a cada asignatura involucrada? La planilla muestra columnas únicas (no por materia).
      // Para apegarse a la lógica planilla por materia, dejamos por asignatura (ya filtrado por id_asignatura in asignIds).
      // Si tus conductas no asocian asignatura, podrías distribuirlas por curso o usar una asignatura "conducta".
      for (const idAsig of asignIds) {
        // Solo sumamos si ya existe el alumno para esa asignatura (tu data de asistencia lo crea)
        const rows = acc[idAsig]?.alumnos;
        if (!rows) continue;
        const row = rows[c.id_alumno];
        if (!row) continue;

        if (c.gravedad === 'MENOS_GRAVE') row.menos_graves += 1;
        else if (c.gravedad === 'GRAVE') row.graves += 1;
        else if (c.gravedad === 'MUY_GRAVE') row.muy_graves += 1;
      }
    }

    // 5) Formato final + conducta EXACTA:
    // CONDUCTA = 10 - ( SP*0.2 + MENOS_GRAVE*1 + GRAVE*2 + MUY_GRAVE*3 )
    const out: {
      id_asignatura: number;
      nombre_asignatura: string;
      id_alumno: number;
      nombre_alumno: string;
      apellido_alumno: string;
      presentes: number;
      sin_permiso: number;
      menos_graves: number;
      graves: number;
      muy_graves: number;
      conducta: number;
    }[] = [];

    for (const [idAsig, datosAsig] of Object.entries(acc) as [string, any][]) {
      for (const [idAlumno, row] of Object.entries(datosAsig.alumnos) as [
        string,
        Row,
      ][]) {
        const penal =
          row.sp * 0.2 +
          row.menos_graves * 1 +
          row.graves * 2 +
          row.muy_graves * 3;

        const conducta = Math.max(10 - penal, 0);
        out.push({
          id_asignatura: Number(idAsig),
          nombre_asignatura: datosAsig.asignatura,
          id_alumno: Number(idAlumno),
          nombre_alumno: row.alumno.nombre,
          apellido_alumno: row.alumno.apellido,
          presentes: row.presentes,
          sin_permiso: row.sp,
          menos_graves: row.menos_graves,
          graves: row.graves,
          muy_graves: row.muy_graves,
          conducta,
        });
      }
    }

    out.sort(
      (a, b) =>
        a.nombre_asignatura.localeCompare(b.nombre_asignatura) ||
        a.nombre_alumno.localeCompare(b.nombre_alumno),
    );

    return out;
  }
}
