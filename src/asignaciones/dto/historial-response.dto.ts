export type HistorialItemDto = {
  id_historial_curso_orientador: number;
  curso: { id_curso: number; nombre: string; seccion: string | null };
  asignatura: { id_asignatura: number | null; nombre: string | null };
  orientador: { id_orientador: number; nombreCompleto: string };
  es_orientador: boolean;
  anio_academico: string | null;
  fecha_asignacion: string | null; // ISO
  fecha_fin: string | null; // ISO
  abierto: boolean; // fecha_fin === null
};

export type PaginadoHistorialDto = {
  page: number;
  pageSize: number;
  total: number;
  count: number;
  data: HistorialItemDto[];
};
