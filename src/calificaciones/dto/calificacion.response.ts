export class CalificacionResponse {
  id_nota: number;
  calificacion: number;
  alumno: {
    id_alumno: number;
    nombre: string;
    apellido: string;
  };
  evaluacion: {
    id_evaluacion: number;
    nombre: string;
    puntaje_maximo: number;
    puntaje_minimo: number;
  };
  asignatura: {
    id_asignatura: number;
    nombre: string;
  };
}
