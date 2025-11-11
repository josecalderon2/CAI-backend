import { ApiProperty } from '@nestjs/swagger';

export class NotaMensualResponseDto {
  @ApiProperty({
    description: 'ID de la nota mensual',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ID del alumno',
    example: 1,
  })
  id_alumno: number;

  @ApiProperty({
    description: 'ID de la asignatura',
    example: 1,
  })
  id_asignatura: number;

  @ApiProperty({
    description: 'Mes (1-12)',
    example: 3,
  })
  mes: number;

  @ApiProperty({
    description: 'Año académico',
    example: 2025,
  })
  anio: number;

  @ApiProperty({
    description: 'Nota de Tarea 1',
    example: 8.5,
    required: false,
  })
  tarea_1?: number;

  @ApiProperty({
    description: 'Nota de Revisión de libros/cuadernos',
    example: 9.0,
    required: false,
  })
  revision_libros_cuadernos?: number;

  @ApiProperty({
    description: 'Nota de Tarea 2',
    example: 7.5,
    required: false,
  })
  tarea_2?: number;

  @ApiProperty({
    description: 'Nota de Laboratorio escrito',
    example: 8.0,
    required: false,
  })
  laboratorio_escrito?: number;

  @ApiProperty({
    description: 'Nota del examen mensual',
    example: 9.0,
    required: false,
  })
  examen_mensual?: number;

  @ApiProperty({
    description: 'Promedio puro de actividades (suma de actividades / cantidad)',
    example: 8.250,
  })
  promedio_puro_actividades: number;

  @ApiProperty({
    description: 'Promedio de actividades al 70% (promedio_puro × 0.70)',
    example: 5.775,
  })
  promedio_70_actividades: number;

  @ApiProperty({
    description: 'Promedio del examen al 30% (examen_mensual × 0.30)',
    example: 2.700,
  })
  promedio_30_examen: number;

  @ApiProperty({
    description: 'Nota mensual final (promedio_70_actividades + promedio_30_examen)',
    example: 8.475,
  })
  promedio: number;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-03-15T10:30:00.000Z',
  })
  fecha_creacion: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-03-16T14:20:00.000Z',
  })
  fecha_actualizacion: Date;
}
