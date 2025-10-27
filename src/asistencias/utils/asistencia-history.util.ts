// src/asistencias/utils/asistencia-history.util.ts
import { AccionAsistencia, EstadoAsistencia } from '@prisma/client';

/**
 * Verifica si hubo cambios reales entre before y after
 * @returns true si hubo al menos un cambio, false si todo es igual
 */
export function hasRealChanges(params: {
  before: {
    estado?: EstadoAsistencia | null;
    observacion?: string | null;
  } | null;
  after: {
    estado?: EstadoAsistencia | null;
    observacion?: string | null;
  };
}): boolean {
  const { before, after } = params;
  
  // Si no hay before, es un CREATE (siempre es un cambio)
  if (!before) return true;

  // Comparar cada campo
  const estadoCambio = before.estado !== after.estado;
  const observacionCambio = before.observacion !== after.observacion;

  // Retorna true si al menos uno cambió
  return estadoCambio || observacionCambio;
}

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

  // Para CREATE, guardamos todo porque es nuevo
  if (accion === AccionAsistencia.CREATE) {
    return {
      id_asistencia: after.id_asistencia ?? null,
      id_alumno: after.id_alumno,
      id_asignatura: after.id_asignatura,
      fecha: after.fecha,
      accion,
      id_orientador_registro,
      estado_anterior: null,
      estado_nuevo: after.estado ?? null,
      observ_anterior: null,
      observ_nueva: after.observacion ?? null,
    };
  }

  // Para UPDATE, guardamos SIEMPRE el contexto completo,
  // pero solo los campos que cambiaron tendrán valores diferentes en anterior vs nuevo
  const estadoCambio = before?.estado !== after.estado;
  const observacionCambio = before?.observacion !== after.observacion;

  return {
    id_asistencia: after.id_asistencia ?? before?.id_asistencia ?? null,
    id_alumno: after.id_alumno,
    id_asignatura: after.id_asignatura,
    fecha: after.fecha,
    accion,
    id_orientador_registro,

    // Si el estado cambió, guardamos before -> after
    // Si NO cambió, guardamos el valor actual en ambos para contexto
    estado_anterior: estadoCambio ? (before?.estado ?? null) : (after.estado ?? null),
    estado_nuevo: after.estado ?? null,

    // Si la observación cambió, guardamos before -> after
    // Si NO cambió, guardamos el valor actual en ambos para contexto
    observ_anterior: observacionCambio ? (before?.observacion ?? null) : (after.observacion ?? null),
    observ_nueva: after.observacion ?? null,
  };
}
