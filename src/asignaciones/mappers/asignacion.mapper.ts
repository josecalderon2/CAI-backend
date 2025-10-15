import { AsignacionResponse } from '../dto/asignacion.response';

function nombreCompleto(d?: { nombre?: string; apellido?: string } | null) {
  if (!d) return '';
  return [d.nombre, d.apellido].filter(Boolean).join(' ').trim();
}

function estadoFromRow(row: {
  activo: boolean;
  fecha_fin?: Date | string | null;
}): 'ACTIVO' | 'INACTIVO' | 'FINALIZADO' {
  if (row.activo === false) return 'INACTIVO';
  if (row.fecha_fin) return 'FINALIZADO';
  return 'ACTIVO';
}

export function toAsignacionResponse(
  row: any, // AsignaturaOrientador incluyendo joins
  curso: any | null, // Curso
  docente: any | null, // Orientador
  asignatura: any | null, // Asignatura
): AsignacionResponse {
  const esOrientador = !!(
    curso &&
    docente &&
    curso.id_orientador &&
    curso.id_orientador === docente.id_orientador
  );

  return {
    id_asignatura_orientador: row.id_asignatura_orientador,

    docente: {
      id_orientador: docente?.id_orientador,
      nombreCompleto: nombreCompleto(docente),
    },

    curso: {
      id_curso: curso?.id_curso ?? asignatura?.id_curso,
      nombre: curso?.nombre ?? '',
      seccion: curso?.seccion ?? null,
      id_orientador: curso?.id_orientador ?? null,
      orientador: curso?.orientador
        ? {
            id_orientador: curso.orientador.id_orientador,
            nombreCompleto: nombreCompleto(curso.orientador),
          }
        : null,
    },

    asignatura: {
      id_asignatura: asignatura?.id_asignatura,
      nombre: asignatura?.nombre ?? '',
      orden_en_reporte: asignatura?.orden_en_reporte ?? null,
      horas_semanas: asignatura?.horas_semanas ?? null,
    },

    cargaHorariaSemanal: Number(asignatura?.horas_semanas ?? 0),
    fechaAsignacion:
      (row.fecha_asignacion as Date)?.toISOString?.() ??
      (row.fecha_asignacion as string),
    estado: estadoFromRow(row),
    esOrientador,
    anio_academico: row.anio_academico ?? null,
  };
}


