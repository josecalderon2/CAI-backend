import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { ListDtoExt, EstadoAsignacion } from './dto/list-asignaciones.dto';
import { HistorialParamsDto } from './dto/historial-params.dto';
import {
  PaginadoHistorialDto,
  HistorialItemDto,
} from './dto/historial-response.dto';
import {
  PaginadoAsignaciones,
  AsignacionResponse,
} from './dto/asignacion.response';
import { toAsignacionResponse } from './mappers/asignacion.mapper';
import { performance } from 'node:perf_hooks';

type MVRow = {
  id_asignatura_orientador: number;
  id_asignatura: number | null;
  nombre_asignatura: string | null;
  horas_semanas: number | null;
  id_orientador: number | null;
  docente: string | null;
  id_curso: number | null;
  curso: string | null;
  seccion: string | null;
  orientador_principal_id: number | null;
  orientador_principal: string | null;
  anio_academico: string | null;
  fecha_asignacion: Date | null;
  fecha_fin: Date | null;
  activo: boolean | null;
  es_orientador: boolean | null;
};

function mapMVRowToResponse(r: MVRow): AsignacionResponse {
  let estado: 'ACTIVO' | 'FINALIZADO' | 'INACTIVO' = 'ACTIVO';
  if (r.activo === false) estado = 'INACTIVO';
  else if (r.fecha_fin) estado = 'FINALIZADO';

  return {
    id_asignatura_orientador: r.id_asignatura_orientador,
    docente: {
      id_orientador: r.id_orientador ?? 0,
      nombreCompleto: r.docente ?? '',
    },
    curso: {
      id_curso: r.id_curso ?? 0,
      nombre: r.curso ?? '',
      seccion: r.seccion ?? null,
      id_orientador: r.orientador_principal_id ?? null,
      orientador: r.orientador_principal_id
        ? {
            id_orientador: r.orientador_principal_id,
            nombreCompleto: r.orientador_principal ?? '',
          }
        : null,
    },
    asignatura: {
      id_asignatura: r.id_asignatura ?? 0,
      nombre: r.nombre_asignatura ?? '',
      orden_en_reporte: null,
      horas_semanas: r.horas_semanas ?? null,
    },
    cargaHorariaSemanal: r.horas_semanas ?? 0,
    fechaAsignacion: r.fecha_asignacion ? r.fecha_asignacion.toISOString() : '',
    estado,
    esOrientador: Boolean(r.es_orientador),
    anio_academico: r.anio_academico ?? null,
  };
}

@Injectable()
export class AsignacionesService {
  constructor(private readonly prisma: PrismaService) {}

  // ===================== MV helpers =====================
  async refreshMV(concurrently = false): Promise<void> {
    if (concurrently) {
      await this.prisma.$executeRawUnsafe(
        `REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_asignaciones;`,
      );
    } else {
      await this.prisma.$executeRawUnsafe(
        `REFRESH MATERIALIZED VIEW public.mv_asignaciones;`,
      );
    }
  }
  private _mvRefreshing: Promise<void> | null = null;
  private _lastMVRefreshAt = 0;

  private async refreshMVCoalesced(concurrently = true) {
    if (this._mvRefreshing) {
      try {
        await this._mvRefreshing;
      } finally {
      }
      return;
    }
    this._mvRefreshing = (async () => {
      try {
        try {
          await this.refreshMV(concurrently);
        } catch {
          await this.refreshMV(false);
        }
      } catch (e) {
        console.error('MV refresh failed:', e);
      } finally {
        this._mvRefreshing = null;
        this._lastMVRefreshAt = Date.now();
      }
    })();
    await this._mvRefreshing;
  }
  private async refreshMVWithTTL(ttlMs = 3000, force = false) {
    const now = Date.now();
    if (!force && now - this._lastMVRefreshAt < ttlMs) return;
    await this.refreshMVCoalesced(true);
  }

  // ===================== RULE helpers =====================

  /** Cierra cualquier ORIENTADOR vigente del curso/año. */
  private async closeExistingPrincipalForCourse(
    tx: any,
    args: { idCurso: number; anio?: string | null; fechaCierre?: Date },
  ) {
    const { idCurso, anio = undefined } = args;
    const fechaCierre = args.fechaCierre ?? new Date();

    await tx.historial_curso_orientador.updateMany({
      where: {
        id_curso: idCurso,
        es_orientador: true,
        fecha_fin: null,
        ...(anio !== undefined ? { anio_academico: anio } : {}),
      },
      data: { fecha_fin: fechaCierre },
    });
  }

  /** Crea (si no existe) un registro ORIENTADOR abierto para ese curso/año/asignatura. */
  private async ensureOpenPrincipal(
    tx: any,
    args: {
      idCurso: number;
      idOrientador: number;
      idAsignatura: number | null;
      anio: string | null;
      fecha: Date;
    },
  ) {
    const { idCurso, idOrientador, idAsignatura, anio, fecha } = args;
    const exists = await tx.historial_curso_orientador.findFirst({
      where: {
        id_curso: idCurso,
        id_orientador: idOrientador,
        id_asignatura: idAsignatura ?? null,
        es_orientador: true,
        fecha_fin: null,
        anio_academico: anio,
      },
    });
    if (!exists) {
      await tx.historial_curso_orientador.create({
        data: {
          id_curso: idCurso,
          id_orientador: idOrientador,
          id_asignatura: idAsignatura ?? null,
          es_orientador: true,
          anio_academico: anio,
          fecha_asignacion: fecha,
          fecha_fin: null,
        },
      });
    }
  }

  /** Crea (si no existe) un registro DOCENTE abierto para ese curso/año/asignatura. */
  private async ensureOpenDocente(
    tx: any,
    args: {
      idCurso: number;
      idOrientador: number;
      idAsignatura: number | null;
      anio: string | null;
      fecha: Date;
    },
  ) {
    const { idCurso, idOrientador, idAsignatura, anio, fecha } = args;
    const exists = await tx.historial_curso_orientador.findFirst({
      where: {
        id_curso: idCurso,
        id_orientador: idOrientador,
        id_asignatura: idAsignatura ?? null,
        es_orientador: false,
        fecha_fin: null,
        anio_academico: anio,
      },
    });
    if (!exists) {
      await tx.historial_curso_orientador.create({
        data: {
          id_curso: idCurso,
          id_orientador: idOrientador,
          id_asignatura: idAsignatura ?? null,
          es_orientador: false,
          anio_academico: anio,
          fecha_asignacion: fecha,
          fecha_fin: null,
        },
      });
    }
  }

  // ===================== FIND ALL =====================
  async findAll(query: ListDtoExt): Promise<PaginadoAsignaciones> {
    const T0 = performance.now();
    let refreshMs = 0,
      txMs = 0,
      mapMs = 0;
    const page = query.page ?? 1;
    const pageSize = query.limit ?? 20;
    const useMV = !!(query as any).use_mv;

    const wantsRefresh =
      (query as any).refresh === true ||
      (query as any).refresh === 'true' ||
      (query as any).refresh === '1';

    if (useMV) {
      const r0 = performance.now();
      if (wantsRefresh) await this.refreshMVWithTTL(0, true);
      else await this.refreshMVWithTTL(3000);
      refreshMs = performance.now() - r0;

      const where: string[] = [];
      const params: any[] = [];
      let p = 1;

      if (query.id_orientador) {
        where.push(`id_orientador = $${p++}`);
        params.push(query.id_orientador);
      }
      if (query.id_asignatura) {
        where.push(`id_asignatura = $${p++}`);
        params.push(query.id_asignatura);
      }
      if (query.id_curso) {
        where.push(`id_curso = $${p++}`);
        params.push(query.id_curso);
      }
      if (query.anio_academico) {
        where.push(`anio_academico = $${p++}`);
        params.push(query.anio_academico);
      }

      if (query.estado === EstadoAsignacion.ACTIVO) {
        where.push(`activo = TRUE`, `fecha_fin IS NULL`);
      } else if (query.estado === EstadoAsignacion.INACTIVO) {
        where.push(`activo = FALSE`);
      } else if (query.estado === EstadoAsignacion.FINALIZADO) {
        where.push(`fecha_fin IS NOT NULL`);
      }

      if (query.q && query.q.trim()) {
        const q = `%${query.q.trim()}%`;
        where.push(
          `(docente ILIKE $${p} OR nombre_asignatura ILIKE $${p} OR curso ILIKE $${p})`,
        );
        params.push(q);
        p++;
      }

      const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const countSQL = `SELECT COUNT(*)::int AS total FROM public.mv_asignaciones ${whereSQL};`;
      const dataSQL = `
        SELECT
          id_asignatura_orientador, id_asignatura, nombre_asignatura, horas_semanas,
          id_orientador, docente, id_curso, curso, seccion,
          orientador_principal_id, orientador_principal,
          anio_academico, fecha_asignacion, fecha_fin, activo, es_orientador
        FROM public.mv_asignaciones
        ${whereSQL}
        ORDER BY fecha_asignacion DESC NULLS LAST, id_asignatura_orientador DESC
        LIMIT $${p++} OFFSET $${p++};
      `;
      const paramsCount = [...params];
      const paramsData = [...params, pageSize, (page - 1) * pageSize];

      const t0 = performance.now();
      const [countRes, rows] = await this.prisma.$transaction([
        this.prisma.$queryRawUnsafe<{ total: number }[]>(
          countSQL,
          ...paramsCount,
        ),
        this.prisma.$queryRawUnsafe<MVRow[]>(dataSQL, ...paramsData),
      ]);
      txMs = performance.now() - t0;

      const m0 = performance.now();
      let data = rows.map(mapMVRowToResponse);
      if ((query as any).soloOrientador)
        data = data.filter((d) => d.esOrientador);
      mapMs = performance.now() - m0;

      const total = countRes[0]?.total ?? 0;
      const totalMs = performance.now() - T0;

      return {
        page,
        pageSize,
        total,
        count: data.length,
        data,
        meta: {
          total_ms: Number(totalMs.toFixed(2)),
          refresh_ms: Number(refreshMs.toFixed(2)),
          tx_ms: Number(txMs.toFixed(2)),
          map_ms: Number(mapMs.toFixed(2)),
          source: 'mv',
        } as any,
      } as any;
    }

    // ORM
    const whereAO: any = {};
    if (query.id_asignatura) whereAO.id_asignatura = query.id_asignatura;
    if (query.id_orientador) whereAO.id_orientador = query.id_orientador;
    if (query.anio_academico) whereAO.anio_academico = query.anio_academico;

    if (query.estado === EstadoAsignacion.ACTIVO) {
      whereAO.activo = true;
      whereAO.fecha_fin = null;
    } else if (query.estado === EstadoAsignacion.INACTIVO) {
      whereAO.activo = false;
    } else if (query.estado === EstadoAsignacion.FINALIZADO) {
      whereAO.fecha_fin = { not: null };
    }

    const orQ: any[] = [];
    if (query.q && query.q.trim()) {
      const contains = {
        contains: query.q.trim(),
        mode: 'insensitive' as const,
      };
      orQ.push({
        orientador: { OR: [{ nombre: contains }, { apellido: contains }] },
      });
      orQ.push({ asignatura: { nombre: contains } });
      orQ.push({ asignatura: { curso: { nombre: contains } } });
    }
    if (query.id_curso)
      whereAO.asignatura = {
        ...(whereAO.asignatura ?? {}),
        id_curso: query.id_curso,
      };

    const whereFinal = orQ.length ? { AND: [whereAO, { OR: orQ }] } : whereAO;

    const t0 = performance.now();
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.asignaturaOrientador.count({ where: whereFinal }),
      this.prisma.asignaturaOrientador.findMany({
        where: whereFinal,
        include: {
          asignatura: { include: { curso: { include: { orientador: true } } } },
          orientador: true,
        },
        orderBy: [
          { fecha_asignacion: 'desc' },
          { id_asignatura_orientador: 'desc' },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    txMs = performance.now() - t0;

    const m0 = performance.now();
    let data = rows.map((row) =>
      toAsignacionResponse(
        row,
        row.asignatura?.curso ?? null,
        row.orientador,
        row.asignatura,
      ),
    );
    if ((query as any).soloOrientador)
      data = data.filter((d) => d.esOrientador);
    mapMs = performance.now() - m0;

    const totalMs = performance.now() - T0;

    return {
      page,
      pageSize,
      total,
      count: data.length,
      data,
      meta: {
        total_ms: Number(totalMs.toFixed(2)),
        tx_ms: Number(txMs.toFixed(2)),
        map_ms: Number(mapMs.toFixed(2)),
        source: 'orm',
      } as any,
    } as any;
  }

  // ===================== CREATE =====================
  async create(dto: CreateAsignacionDto): Promise<AsignacionResponse> {
    try {
      const result = await this.prisma.$transaction(
        async (tx) => {
          const asignatura = await tx.asignatura.findUnique({
            where: { id_asignatura: dto.id_asignatura },
            include: { curso: { include: { orientador: true } } },
          });
          if (!asignatura)
            throw new NotFoundException('Asignatura no encontrada');

          const curso = asignatura.curso;
          if (!curso)
            throw new BadRequestException(
              'La asignatura no está vinculada a un curso',
            );

          if (dto.id_curso && dto.id_curso !== curso.id_curso) {
            throw new BadRequestException(
              `La asignatura ${dto.id_asignatura} pertenece al curso ${curso.id_curso}, no al ${dto.id_curso}`,
            );
          }

          // Evita 2 docentes activos sobre la misma asignatura/año
          const existenteActiva = await tx.asignaturaOrientador.findFirst({
            where: {
              id_asignatura: dto.id_asignatura,
              anio_academico: dto.anio_academico,
              activo: true,
              fecha_fin: null,
            },
            include: { orientador: true },
          });
          if (
            existenteActiva &&
            existenteActiva.id_orientador !== dto.id_orientador
          ) {
            const doc = existenteActiva.orientador;
            const nombreDoc = doc
              ? `${doc.nombre} ${doc.apellido}`
              : 'otro docente';
            throw new ConflictException(
              `La asignatura ${dto.id_asignatura} ya está asignada a ${nombreDoc} en ${dto.anio_academico}.`,
            );
          }

          if (
            typeof dto.cargaHorariaSemanal === 'number' &&
            dto.cargaHorariaSemanal > 0 &&
            dto.cargaHorariaSemanal !== asignatura.horas_semanas
          ) {
            await tx.asignatura.update({
              where: { id_asignatura: asignatura.id_asignatura },
              data: { horas_semanas: dto.cargaHorariaSemanal },
            });
            (asignatura as any).horas_semanas = dto.cargaHorariaSemanal;
          }

          const ao = await tx.asignaturaOrientador.upsert({
            where: {
              id_asignatura_id_orientador_anio_academico: {
                id_asignatura: dto.id_asignatura,
                id_orientador: dto.id_orientador,
                anio_academico: dto.anio_academico,
              },
            },
            update: {
              activo: dto.activo ?? true,
              fecha_asignacion: dto.fecha_asignacion
                ? new Date(dto.fecha_asignacion)
                : undefined,
              fecha_fin: null,
            },
            create: {
              id_asignatura: dto.id_asignatura,
              id_orientador: dto.id_orientador,
              anio_academico: dto.anio_academico,
              fecha_asignacion: dto.fecha_asignacion
                ? new Date(dto.fecha_asignacion)
                : undefined,
              activo: dto.activo ?? true,
            },
          });

          const now = dto.fecha_asignacion
            ? new Date(dto.fecha_asignacion)
            : new Date();

          if (dto.es_orientador === true) {
            // Cierra principal vigente del curso/año
            await this.closeExistingPrincipalForCourse(tx, {
              idCurso: curso.id_curso,
              anio: dto.anio_academico ?? null,
              fechaCierre: now,
            });

            // Cierra cualquier DOCENTE abierto del mismo orientador en el curso/año
            await tx.historial_curso_orientador.updateMany({
              where: {
                id_curso: curso.id_curso,
                id_orientador: dto.id_orientador,
                es_orientador: false,
                fecha_fin: null,
                anio_academico: dto.anio_academico ?? null,
              },
              data: { fecha_fin: now },
            });

            // Crea principal vigente (idempotente si ya existiera por concurrencia)
            await this.ensureOpenPrincipal(tx, {
              idCurso: curso.id_curso,
              idOrientador: dto.id_orientador,
              idAsignatura: asignatura.id_asignatura,
              anio: dto.anio_academico ?? null,
              fecha: now,
            });

            // Refleja en curso
            if (curso.id_orientador !== dto.id_orientador) {
              await tx.curso.update({
                where: { id_curso: curso.id_curso },
                data: { id_orientador: dto.id_orientador },
              });
            }
          } else {
            // Docente no principal: evita duplicados abiertos
            await this.ensureOpenDocente(tx, {
              idCurso: curso.id_curso,
              idOrientador: dto.id_orientador,
              idAsignatura: asignatura.id_asignatura,
              anio: dto.anio_academico ?? null,
              fecha: now,
            });
          }

          const loaded = await tx.asignaturaOrientador.findUnique({
            where: { id_asignatura_orientador: ao.id_asignatura_orientador },
            include: {
              asignatura: {
                include: { curso: { include: { orientador: true } } },
              },
              orientador: true,
            },
          });
          return loaded!;
        },
        { isolationLevel: 'Serializable' },
      );

      await this.refreshMVCoalesced(true);

      const curso = result.asignatura?.curso ?? null;
      const docente = result.orientador ?? null;
      const asignatura = result.asignatura ?? null;
      return toAsignacionResponse(result, curso, docente, asignatura);
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException(
          'Regla violada: ya existe un orientador principal vigente para este curso (y año).',
        );
      }
      throw e;
    }
  }

  // ===================== FIND ONE =====================
  async findOne(id_asignatura_orientador: number): Promise<AsignacionResponse> {
    const row = await this.prisma.asignaturaOrientador.findUnique({
      where: { id_asignatura_orientador },
      include: {
        asignatura: { include: { curso: { include: { orientador: true } } } },
        orientador: true,
      },
    });
    if (!row) throw new NotFoundException('Asignación no encontrada');

    const curso = row.asignatura?.curso ?? null;
    const docente = row.orientador ?? null;
    const asignatura = row.asignatura ?? null;

    return toAsignacionResponse(row, curso, docente, asignatura);
  }

  // ===================== UPDATE (PATCH) =====================
  async update(
    id_asignatura_orientador: number,
    dto: UpdateAsignacionDto,
  ): Promise<AsignacionResponse> {
    try {
      const updated = await this.prisma.$transaction(
        async (tx) => {
          // 1) Actual
          const current = await tx.asignaturaOrientador.findUnique({
            where: { id_asignatura_orientador },
            include: {
              asignatura: {
                include: { curso: { include: { orientador: true } } },
              },
              orientador: true,
            },
          });
          if (!current) throw new NotFoundException('Asignación no encontrada');

          const targetDocenteId = dto.id_orientador ?? current.id_orientador;
          const anio = dto.anio_academico ?? current.anio_academico ?? null;

          // 2) Destino
          const nextAsignaturaId = dto.id_asignatura ?? current.id_asignatura;
          const nextAsignatura = await tx.asignatura.findUnique({
            where: { id_asignatura: nextAsignaturaId },
            include: { curso: { include: { orientador: true } } },
          });
          if (!nextAsignatura)
            throw new NotFoundException('Asignatura destino no encontrada');
          const nextCurso = nextAsignatura.curso;
          if (!nextCurso)
            throw new BadRequestException(
              'La asignatura destino no está vinculada a un curso',
            );
          if (dto.id_curso && dto.id_curso !== nextCurso.id_curso) {
            throw new BadRequestException(
              `La asignatura ${nextAsignaturaId} pertenece al curso ${nextCurso.id_curso}, no al ${dto.id_curso}`,
            );
          }

          // 3) Carga horaria
          if (
            typeof dto.cargaHorariaSemanal === 'number' &&
            dto.cargaHorariaSemanal > 0 &&
            dto.cargaHorariaSemanal !== nextAsignatura.horas_semanas
          ) {
            await tx.asignatura.update({
              where: { id_asignatura: nextAsignatura.id_asignatura },
              data: { horas_semanas: dto.cargaHorariaSemanal },
            });
          }

          const promoteToOrientador = dto.es_orientador === true;
          const demoteFromOrientador = dto.es_orientador === false;
          const fecha = dto.fecha_asignacion
            ? new Date(dto.fecha_asignacion)
            : new Date();
          const subjectChanged = current.id_asignatura !== nextAsignaturaId;

          // 4) ¿Este docente tiene un principal abierto en este curso/año?
          const openPrincipalThisTeacher =
            await tx.historial_curso_orientador.findFirst({
              where: {
                id_curso: nextCurso.id_curso,
                id_orientador: targetDocenteId,
                es_orientador: true,
                fecha_fin: null,
                anio_academico: anio,
              },
              select: { id_historial_curso_orientador: true },
            });

          // Si cambia de asignatura, cierra DOCENTE abierto de la asignatura vieja
          if (subjectChanged) {
            const oldCursoId = current.asignatura?.id_curso ?? null;
            if (oldCursoId) {
              await tx.historial_curso_orientador.updateMany({
                where: {
                  id_curso: oldCursoId,
                  id_orientador: targetDocenteId,
                  id_asignatura: current.id_asignatura,
                  es_orientador: false,
                  fecha_fin: null,
                  anio_academico: anio,
                },
                data: { fecha_fin: fecha },
              });
            }
          }

          // === Reglas ORIENTADOR/DOCENTE ===
          let principalTocado = false;

          // (A) Migración de principal SOLO si:
          //     - el docente YA tiene principal abierto en el curso/año, y
          //     - cambió la asignatura, y
          //     - ESTE docente ES el principal vigente del curso
          if (
            !principalTocado &&
            !!openPrincipalThisTeacher &&
            subjectChanged &&
            nextCurso.id_orientador === targetDocenteId
          ) {
            await this.closeExistingPrincipalForCourse(tx, {
              idCurso: nextCurso.id_curso,
              anio,
              fechaCierre: fecha,
            });

            // cierra DOCENTE abiertos del mismo docente en ese curso/año
            await tx.historial_curso_orientador.updateMany({
              where: {
                id_curso: nextCurso.id_curso,
                id_orientador: targetDocenteId,
                es_orientador: false,
                fecha_fin: null,
                anio_academico: anio,
              },
              data: { fecha_fin: fecha },
            });

            await this.ensureOpenPrincipal(tx, {
              idCurso: nextCurso.id_curso,
              idOrientador: targetDocenteId,
              idAsignatura: nextAsignatura.id_asignatura,
              anio,
              fecha,
            });

            await tx.curso.update({
              where: { id_curso: nextCurso.id_curso },
              data: { id_orientador: targetDocenteId },
            });

            principalTocado = true;
          }

          // (B) Promoción explícita (si no migramos ya)
          if (!principalTocado && promoteToOrientador) {
            await this.closeExistingPrincipalForCourse(tx, {
              idCurso: nextCurso.id_curso,
              anio,
              fechaCierre: fecha,
            });

            await tx.historial_curso_orientador.updateMany({
              where: {
                id_curso: nextCurso.id_curso,
                id_orientador: targetDocenteId,
                es_orientador: false,
                fecha_fin: null,
                anio_academico: anio,
              },
              data: { fecha_fin: fecha },
            });

            await this.ensureOpenPrincipal(tx, {
              idCurso: nextCurso.id_curso,
              idOrientador: targetDocenteId,
              idAsignatura: nextAsignatura.id_asignatura,
              anio,
              fecha,
            });

            await tx.curso.update({
              where: { id_curso: nextCurso.id_curso },
              data: { id_orientador: targetDocenteId },
            });

            principalTocado = true;
          }

          // (C) Degradación explícita
          if (demoteFromOrientador) {
            await this.closeExistingPrincipalForCourse(tx, {
              idCurso: nextCurso.id_curso,
              anio,
              fechaCierre: fecha,
            });
            await tx.curso.update({
              where: { id_curso: nextCurso.id_curso },
              data: { id_orientador: null },
            });

            await this.ensureOpenDocente(tx, {
              idCurso: nextCurso.id_curso,
              idOrientador: targetDocenteId,
              idAsignatura: nextAsignatura.id_asignatura,
              anio,
              fecha,
            });
          }

          // (D) Cambio normal (docente o materia) sin promover/degradar:
          //     Si el docente NO es el principal vigente, garantiza "Docente" abierto; si lo es, no abras nada extra.
          if (
            !promoteToOrientador &&
            !demoteFromOrientador &&
            (dto.id_orientador || dto.id_asignatura) &&
            !(nextCurso.id_orientador === targetDocenteId) // <- guardia extra
          ) {
            await this.ensureOpenDocente(tx, {
              idCurso: nextCurso.id_curso,
              idOrientador: targetDocenteId,
              idAsignatura: nextAsignatura.id_asignatura,
              anio,
              fecha,
            });
          }

          // 9) Actualiza la fila AO
          const dataUpdate: any = {
            id_asignatura: nextAsignatura.id_asignatura,
            id_orientador: targetDocenteId,
            anio_academico: anio ?? undefined,
            fecha_asignacion: dto.fecha_asignacion
              ? new Date(dto.fecha_asignacion)
              : undefined,
          };

          if (dto.activo === false) {
            dataUpdate.activo = false;
            dataUpdate.fecha_fin = dto.fecha_fin
              ? new Date(dto.fecha_fin)
              : new Date();
          } else if (dto.activo === true) {
            dataUpdate.activo = true;
            dataUpdate.fecha_fin =
              dto.fecha_fin === undefined
                ? null
                : dto.fecha_fin
                  ? new Date(dto.fecha_fin)
                  : null;
          } else if (dto.fecha_fin !== undefined) {
            dataUpdate.fecha_fin = dto.fecha_fin
              ? new Date(dto.fecha_fin)
              : null;
          }

          const row = await tx.asignaturaOrientador.update({
            where: { id_asignatura_orientador },
            data: dataUpdate,
            include: {
              asignatura: {
                include: { curso: { include: { orientador: true } } },
              },
              orientador: true,
            },
          });

          // 10) Si cerraste AO, cierra SOLO registros de DOCENTE abiertos del mismo par (no toques principal)
          if (dto.activo === false || dto.fecha_fin) {
            const cierre = dto.fecha_fin ? new Date(dto.fecha_fin) : new Date();
            await tx.historial_curso_orientador.updateMany({
              where: {
                id_curso: nextCurso.id_curso,
                id_orientador: targetDocenteId,
                id_asignatura: nextAsignatura.id_asignatura,
                es_orientador: false, // <- filtro agregado
                fecha_fin: null,
                anio_academico: anio,
              },
              data: { fecha_fin: cierre },
            });
          }

          return row;
        },
        { isolationLevel: 'Serializable' },
      );

      await this.refreshMVCoalesced(true);

      const curso = updated.asignatura?.curso ?? null;
      const docente = updated.orientador ?? null;
      const asignatura = updated.asignatura ?? null;
      return toAsignacionResponse(updated, curso, docente, asignatura);
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException(
          'Ya existe una asignación con esa asignatura/docente/año.',
        );
      }
      throw e;
    }
  }

  // ===================== REMOVE (soft close) =====================
  async remove(id_asignatura_orientador: number): Promise<AsignacionResponse> {
    const row = await this.prisma.$transaction(
      async (tx) => {
        const now = new Date();
        const updated = await tx.asignaturaOrientador.update({
          where: { id_asignatura_orientador },
          data: { activo: false, fecha_fin: now },
          include: {
            asignatura: {
              include: { curso: { include: { orientador: true } } },
            },
            orientador: true,
          },
        });

        const cursoId = updated.asignatura?.id_curso;
        if (cursoId) {
          await tx.historial_curso_orientador.updateMany({
            where: {
              id_curso: cursoId,
              id_orientador: updated.id_orientador,
              id_asignatura: updated.asignatura?.id_asignatura ?? null,
              fecha_fin: null,
              anio_academico: updated.anio_academico ?? null,
            },
            data: { fecha_fin: now },
          });
        }

        return updated;
      },
      { isolationLevel: 'Serializable' },
    );

    await this.refreshMVCoalesced(true);

    const curso = row.asignatura?.curso ?? null;
    const docente = row.orientador ?? null;
    const asignatura = row.asignatura ?? null;
    return toAsignacionResponse(row, curso, docente, asignatura);
  }

  // ===================== HISTORIAL =====================
  async getHistorial(query: HistorialParamsDto): Promise<PaginadoHistorialDto> {
    const page = query.page ?? 1;
    const pageSize = query.limit ?? 20;
    const order = query.order ?? 'desc';

    const where: any = {};
    if (typeof query.id_curso === 'number') where.id_curso = query.id_curso;
    if (typeof query.id_orientador === 'number')
      where.id_orientador = query.id_orientador;

    if (query.id_asignatura === null) where.id_asignatura = null;
    else if (typeof query.id_asignatura === 'number')
      where.id_asignatura = query.id_asignatura;

    if (typeof query.es_orientador === 'boolean')
      where.es_orientador = query.es_orientador;

    if (query.anio_academico === null) where.anio_academico = null;
    else if (typeof query.anio_academico === 'string')
      where.anio_academico = query.anio_academico;

    if (query.estado === 'abierto') where.fecha_fin = null;
    else if (query.estado === 'cerrado') where.fecha_fin = { not: null };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.historial_curso_orientador.count({ where }),
      this.prisma.historial_curso_orientador.findMany({
        where,
        include: { curso: true, orientador: true, asignatura: true },
        orderBy: [{ fecha_asignacion: order as 'asc' | 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const data: HistorialItemDto[] = rows.map((r) => ({
      id_historial_curso_orientador: r.id_historial_curso_orientador,
      curso: {
        id_curso: r.curso.id_curso,
        nombre: r.curso.nombre,
        seccion: r.curso.seccion ?? null,
      },
      asignatura: {
        id_asignatura: r.asignatura ? r.asignatura.id_asignatura : null,
        nombre: r.asignatura ? r.asignatura.nombre : null,
      },
      orientador: {
        id_orientador: r.orientador.id_orientador,
        nombreCompleto:
          `${r.orientador.nombre} ${r.orientador.apellido}`.trim(),
      },
      es_orientador: Boolean(r.es_orientador),
      anio_academico: r.anio_academico ?? null,
      fecha_asignacion: r.fecha_asignacion
        ? r.fecha_asignacion.toISOString()
        : null,
      fecha_fin: r.fecha_fin ? r.fecha_fin.toISOString() : null,
      abierto: r.fecha_fin === null,
    }));

    return { page, pageSize, total, count: data.length, data };
  }
}
