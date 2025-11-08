import { ApiProperty } from '@nestjs/swagger';

export class ActividadDetalle {
  @ApiProperty({ example: 1 })
  id_tipo_actividad: number;

  @ApiProperty({ example: 'Tarea' })
  tipo_actividad_nombre: string;

  @ApiProperty({ example: 1 })
  numero_actividad?: number;

  @ApiProperty({ example: 'Tarea 1' })
  nombre_completo: string;

  @ApiProperty({ example: 8.0 })
  nota: number;
}

export class NotaMensualResponseDto {
  @ApiProperty({ example: 1 })
  id_alumno: number;

  @ApiProperty({ example: 1 })
  id_asignatura: number;

  @ApiProperty({ example: 'Febrero' })
  mes: string;

  @ApiProperty({ example: 1 })
  trimestre: number;

  @ApiProperty({ example: '2025' })
  anio_academico: string;

  @ApiProperty({
    type: [ActividadDetalle],
    description: 'Lista de actividades evaluadas',
  })
  actividades: ActividadDetalle[];

  @ApiProperty({
    example: 9.0,
    description: 'Nota del examen mensual (30%)',
  })
  examen_mensual: number;

  @ApiProperty({
    example: 8.25,
    description: 'Promedio puro de actividades (sin ponderar)',
  })
  promedio_puro_actividades: number;

  @ApiProperty({
    example: 5.775,
    description: 'Promedio ponderado de actividades (70%)',
  })
  promedio_70_actividades: number;

  @ApiProperty({
    example: 2.7,
    description: 'Nota ponderada del examen (30%)',
  })
  promedio_30_examen: number;

  @ApiProperty({
    example: 8.47,
    description: 'Nota mensual final (70% + 30%)',
  })
  nota_mensual: number;

  @ApiProperty({
    example: 28,
    description: 'Porcentaje de aporte del mes al trimestre',
  })
  porcentaje_aporte_trimestre: number;

  @ApiProperty({
    example: 2.37,
    description: 'Aporte del mes convertido al trimestre',
  })
  aporte_al_trimestre: number;

  @ApiProperty({
    example: new Date(),
    description: 'Fecha de registro de la nota',
  })
  fecha_registro: Date;
}
