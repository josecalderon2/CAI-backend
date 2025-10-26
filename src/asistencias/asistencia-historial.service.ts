// src/asistencias/asistencia-historial.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AccionAsistencia } from '@prisma/client';

type HistorialItemDTO = {
  id: number;
  id_asistencia: number | null;
  id_alumno: number;
  id_asignatura: number;
  fecha: string; // ISO
  accion: AccionAsistencia;
  id_orientador_registro: number;
  estado_anterior?: string | null;
  estado_nuevo?: string | null;
  observacion_anterior?: string | null;
  observacion_nueva?: string | null;
  created_at: string; // ISO

  // opcional: datos relacionados (si existen a través de `asistencia`)
  alumno?: { id_alumno: number; nombre: string; apellido: string };
  asignatura?: { id_asignatura: number; nombre: string };
  orientador?: { id_orientador: number; nombre: string; apellido: string };
};

@Injectable()
export class AsistenciaHistorialService {
  constructor(private prisma: PrismaService) {}

  private mapItem = (r: any): HistorialItemDTO => ({
    id: r.id_historial,
    id_asistencia: r.id_asistencia ?? null,
    id_alumno: r.id_alumno,
    id_asignatura: r.id_asignatura,
    fecha: r.fecha?.toISOString?.() ?? r.fecha,
    accion: r.accion,
    id_orientador_registro: r.id_orientador_registro,
    estado_anterior: r.estado_anterior ?? null,
    estado_nuevo: r.estado_nuevo ?? null,
    observacion_anterior: r.observ_anterior ?? null,
    observacion_nueva: r.observ_nueva ?? null,
    created_at: r.creadoEn?.toISOString?.() ?? r.creadoEn,

    alumno: r.asistencia?.alumno
      ? {
          id_alumno: r.asistencia.alumno.id_alumno,
          nombre: r.asistencia.alumno.nombre,
          apellido: r.asistencia.alumno.apellido,
        }
      : undefined,
    asignatura: r.asistencia?.asignatura
      ? {
          id_asignatura: r.asistencia.asignatura.id_asignatura,
          nombre: r.asistencia.asignatura.nombre,
        }
      : undefined,
    orientador: r.asistencia?.orientador
      ? {
          id_orientador: r.asistencia.orientador.id_orientador,
          nombre: r.asistencia.orientador.nombre,
          apellido: r.asistencia.orientador.apellido,
        }
      : undefined,
  });

  async findByAsistencia(id_asistencia: number) {
    const rows = await this.prisma.asistenciaHistorial.findMany({
      where: { id_asistencia },
      orderBy: [{ creadoEn: 'desc' }, { id_historial: 'desc' }],
      include: {
        asistencia: {
          select: {
            alumno: {
              select: { id_alumno: true, nombre: true, apellido: true },
            },
            asignatura: { select: { id_asignatura: true, nombre: true } },
            orientador: {
              select: { id_orientador: true, nombre: true, apellido: true },
            },
          },
        },
      },
    });
    return rows.map(this.mapItem);
  }

  async search(params: {
    id_alumno?: number;
    id_asignatura?: number;
    desde?: string;
    hasta?: string;
    accion?: AccionAsistencia;
    page?: number;
    limit?: number;
  }) {
    const { id_alumno, id_asignatura, desde, hasta, accion } = params;
    const page = Math.max(1, params.page || 1);
    const take = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * take;

    if (
      accion &&
      ![
        'CREATE',
        'UPDATE',
        'DELETE',
        'BULK_IMPORT',
        'RECTIFY',
        'ROLLBACK',
      ].includes(accion)
    ) {
      throw new BadRequestException('accion inválida');
    }

    const where: any = {};
    if (id_alumno) where.id_alumno = id_alumno; // <- columnas existen en historial
    if (id_asignatura) where.id_asignatura = id_asignatura;
    if (accion) where.accion = accion;

    if (desde || hasta) {
      where.creadoEn = {};
      if (desde) where.creadoEn.gte = new Date(desde);
      if (hasta) where.creadoEn.lte = new Date(hasta + 'T23:59:59.999Z');
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.asistenciaHistorial.findMany({
        where,
        orderBy: [{ creadoEn: 'desc' }, { id_historial: 'desc' }],
        skip,
        take,
        include: {
          asistencia: {
            select: {
              alumno: {
                select: { id_alumno: true, nombre: true, apellido: true },
              },
              asignatura: { select: { id_asignatura: true, nombre: true } },
              orientador: {
                select: { id_orientador: true, nombre: true, apellido: true },
              },
            },
          },
        },
      }),
      this.prisma.asistenciaHistorial.count({ where }),
    ]);

    const items = rows.map(this.mapItem);

    return {
      items,
      meta: {
        totalItems: total,
        itemCount: items.length,
        itemsPerPage: take,
        totalPages: Math.ceil(total / take),
        currentPage: page,
      },
    };
  }
}
