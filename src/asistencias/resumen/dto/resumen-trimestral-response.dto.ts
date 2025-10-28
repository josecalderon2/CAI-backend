import { ApiProperty } from '@nestjs/swagger';

export class InfraccionDetalleDto {
  @ApiProperty({
    description: 'Categoría de la infracción',
    enum: ['MENOS_GRAVE', 'GRAVE', 'MUY_GRAVE'],
    example: 'MENOS_GRAVE',
  })
  categoria: string;

  @ApiProperty({
    description: 'Artículo del reglamento infringido',
    example: '5.1.3 literal b',
  })
  articulo: string;

  @ApiProperty({
    description: 'Descripción de la infracción',
    example: 'Faltar al respeto a compañeros',
  })
  descripcion: string;

  @ApiProperty({
    description: 'Cantidad de veces que se cometió esta infracción',
    example: 2,
  })
  conteo: number;
}

export class ResumenTrimestralResponseDto {
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
    description: 'Detalle de infracciones cometidas',
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
      'Puntuación de conducta calculada. Fórmula: 10 - (SP * 0.2) - (Menos Graves * 1) - (Graves * 2) - (Muy Graves * 3)',
    example: 6.6,
    minimum: 0,
    maximum: 10,
  })
  puntuacion_conducta: number;
}
