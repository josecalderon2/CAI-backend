import { ApiProperty } from '@nestjs/swagger';
import { InfraccionDetalleDto } from './resumen-trimestral-response.dto';

/**
 * Datos de un trimestre individual dentro del reporte consolidado
 */
export class DatosTrimestreDto {
  @ApiProperty({
    description: 'Número del trimestre (1, 2, 3, o 4)',
    example: 1,
  })
  trimestre: number;

  @ApiProperty({
    description: 'Total de ausencias justificadas (P - Con Permiso)',
    example: 3,
  })
  total_justificadas: number;

  @ApiProperty({
    description: 'Total de ausencias injustificadas (SP - Sin Permiso)',
    example: 2,
  })
  total_injustificadas: number;

  @ApiProperty({
    description: 'Total de atrasos (A - Atrasos)',
    example: 1,
  })
  total_atrasos: number;

  @ApiProperty({
    description: 'Detalle de infracciones cometidas en este trimestre',
    type: [InfraccionDetalleDto],
    isArray: true,
  })
  infracciones: InfraccionDetalleDto[];

  @ApiProperty({
    description: 'Total de infracciones menos graves',
    example: 3,
  })
  total_menos_graves: number;

  @ApiProperty({
    description: 'Total de infracciones graves',
    example: 1,
  })
  total_graves: number;

  @ApiProperty({
    description: 'Total de infracciones muy graves',
    example: 0,
  })
  total_muy_graves: number;

  @ApiProperty({
    description:
      'Puntuación de conducta del trimestre. Fórmula: 10 - (SP * 0.2) - (Menos Graves * 1) - (Graves * 2) - (Muy Graves * 3)',
    example: 6.6,
    minimum: 0,
    maximum: 10,
  })
  puntuacion_conducta: number;
}

/**
 * Reporte trimestral consolidado de un alumno (todos los trimestres del año)
 */
export class ResumenTrimestralConsolidadoResponseDto {
  @ApiProperty({
    description: 'ID del alumno',
    example: 1,
  })
  id_alumno: number;

  @ApiProperty({
    description: 'Nombre del alumno',
    example: 'Juan',
  })
  nombre: string;

  @ApiProperty({
    description: 'Apellido del alumno',
    example: 'Pérez',
  })
  apellido: string;

  @ApiProperty({
    description: 'Datos de cada trimestre del año académico',
    type: [DatosTrimestreDto],
    isArray: true,
  })
  trimestres: DatosTrimestreDto[];

  @ApiProperty({
    description: 'Total anual de ausencias justificadas',
    example: 10,
  })
  total_anual_justificadas: number;

  @ApiProperty({
    description: 'Total anual de ausencias injustificadas',
    example: 5,
  })
  total_anual_injustificadas: number;

  @ApiProperty({
    description: 'Total anual de atrasos',
    example: 3,
  })
  total_anual_atrasos: number;

  @ApiProperty({
    description: 'Total anual de infracciones menos graves',
    example: 8,
  })
  total_anual_menos_graves: number;

  @ApiProperty({
    description: 'Total anual de infracciones graves',
    example: 2,
  })
  total_anual_graves: number;

  @ApiProperty({
    description: 'Total anual de infracciones muy graves',
    example: 1,
  })
  total_anual_muy_graves: number;

  @ApiProperty({
    description:
      'Puntuación de conducta anual calculada sobre los totales anuales. Fórmula: 10 - (SP * 0.2) - (Menos Graves * 1) - (Graves * 2) - (Muy Graves * 3)',
    example: 5.0,
    minimum: 0,
    maximum: 10,
  })
  puntuacion_conducta_anual: number;

  @ApiProperty({
    description: 'Promedio de las puntuaciones trimestrales',
    example: 6.5,
    minimum: 0,
    maximum: 10,
  })
  promedio_trimestral: number;
}
