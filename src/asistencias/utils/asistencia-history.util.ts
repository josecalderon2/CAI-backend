// src/asistencias/utils/asistencia-history.util.ts
import { AccionAsistencia, EstadoAsistencia } from '@prisma/client';

export function buildAsistenciaHistorialInput(params: {
  accion: AccionAsistencia;
  before: {
    id_asistencia?: number | null;
    id_alumno: number;
    id_asignatura: number;
    fecha: Date;
    estado?: EstadoAsistencia | null;
    observacion?: string | null;
  } | null;
  after: {
    id_asistencia?: number | null;
    id_alumno: number;
    id_asignatura: number;
    fecha: Date;
    estado?: EstadoAsistencia | null;
    observacion?: string | null;
  };
  id_orientador_registro: number; // quién ejecutó la acción (docente)
}) {
  const { accion, before, after, id_orientador_registro } = params;

  return {
    id_asistencia: after.id_asistencia ?? before?.id_asistencia ?? null,

    id_alumno: after.id_alumno,
    id_asignatura: after.id_asignatura,
    fecha: after.fecha,

    accion,

    id_orientador_registro,

    estado_anterior: before?.estado ?? null,
    estado_nuevo: after?.estado ?? null,

    observ_anterior: before?.observacion ?? null,
    observ_nueva: after?.observacion ?? null,
  };
}
