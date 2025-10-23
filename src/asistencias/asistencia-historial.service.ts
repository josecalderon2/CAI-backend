// src/asistencias/asistencia-historial.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AccionAsistencia } from '@prisma/client';

@Injectable()
export class AsistenciaHistorialService {
  constructor(private prisma: PrismaService) {}

  findByAsistencia(id_asistencia: number) {
    return this.prisma.asistenciaHistorial.findMany({
      where: { id_asistencia },
      orderBy: { id_historial: 'desc' },
    });
  }

  async search(params: {
    id_alumno?: number;
    id_asignatura?: number;
    desde?: string;
    hasta?: string;
    accion?: AccionAsistencia;
    correlacion_id?: string;
    page?: number;
    limit?: number;
  }) {
    const { id_alumno, id_asignatura, desde, hasta, accion, correlacion_id } =
      params;
    const page = Math.max(1, params.page || 1);
    const take = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * take;

    const where: any = {};
    if (id_alumno) where.id_alumno = id_alumno;
    if (id_asignatura) where.id_asignatura = id_asignatura;
    if (accion) where.accion = accion;
    if (correlacion_id) where.correlacion_id = correlacion_id;
    if (desde || hasta) {
      where.creadoEn = {};
      if (desde) where.creadoEn.gte = new Date(desde);
      if (hasta) where.creadoEn.lte = new Date(hasta + 'T23:59:59.999Z');
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.asistenciaHistorial.findMany({
        where,
        orderBy: [{ creadoEn: 'desc' }, { id_historial: 'desc' }],
        skip,
        take,
      }),
      this.prisma.asistenciaHistorial.count({ where }),
    ]);

    return {
      page,
      take,
      total,
      items,
    };
  }
}
