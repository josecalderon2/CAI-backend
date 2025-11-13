import { ApiProperty } from '@nestjs/swagger';

export class AlumnoConCalificacionDto {
  @ApiProperty({ description: 'ID del alumno' })
  id_alumno: number;

  @ApiProperty({ description: 'Nombre del alumno' })
  nombre: string;

  @ApiProperty({ description: 'Apellido del alumno' })
  apellido: string;

  @ApiProperty({ description: 'Género del alumno', required: false })
  genero?: string;

  @ApiProperty({ description: 'Calificación del alumno (si existe)', required: false })
  calificacion?: number;

  @ApiProperty({ description: 'ID de la nota (si existe)', required: false })
  id_nota?: number;

  @ApiProperty({ description: 'Indica si el alumno ya tiene calificación' })
  tiene_calificacion: boolean;
}

export class AlumnosConCalificacionesResponse {
  @ApiProperty({ description: 'ID de la evaluación' })
  id_evaluacion: number;

  @ApiProperty({ description: 'Nombre de la evaluación' })
  nombre_evaluacion: string;

  @ApiProperty({ description: 'Asignatura de la evaluación' })
  asignatura: {
    id_asignatura: number;
    nombre: string;
  };

  @ApiProperty({ description: 'Curso al que pertenecen los alumnos' })
  curso: {
    id_curso: number;
    nombre: string;
    seccion: string;
  };

  @ApiProperty({ description: 'Total de alumnos en el curso' })
  total_alumnos: number;

  @ApiProperty({ description: 'Cantidad de alumnos con calificación' })
  alumnos_calificados: number;

  @ApiProperty({ description: 'Lista de alumnos con sus calificaciones', type: [AlumnoConCalificacionDto] })
  alumnos: AlumnoConCalificacionDto[];
}
