import { ApiProperty } from '@nestjs/swagger';
import { InfraccionDetalleDto } from './resumen-trimestral-response.dto';

export class ResumenAnualResponseDto {
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
    description: 'Total de ausencias justificadas del año (E - Con Permiso)',
    example: 12,
  })
  total_justificadas: number;

  @ApiProperty({
    description: 'Total de ausencias injustificadas del año (SP - Sin Permiso)',
    example: 5,
  })
  total_injustificadas: number;

  @ApiProperty({
    description: 'Total de atrasos del año (A - Atrasos)',
    example: 8,
  })
  total_atrasos: number;

  @ApiProperty({
    description: 'Detalle de infracciones cometidas durante el año',
    type: [InfraccionDetalleDto],
    isArray: true,
  })
  infracciones: InfraccionDetalleDto[];

  @ApiProperty({
    description: 'Total de infracciones menos graves del año',
    example: 10,
  })
  total_menos_graves: number;

  @ApiProperty({
    description: 'Total de infracciones graves del año',
    example: 3,
  })
  total_graves: number;

  @ApiProperty({
    description: 'Total de infracciones muy graves del año',
    example: 1,
  })
  total_muy_graves: number;

  @ApiProperty({
    description:
      'Puntuación promedio de conducta anual. Fórmula: 10 - (SP * 0.2) - (Menos Graves * 1) - (Graves * 2) - (Muy Graves * 3)',
    example: 7.4,
    minimum: 0,
    maximum: 10,
  })
  puntuacion_conducta_anual: number;

  @ApiProperty({
    description: 'Desglose trimestral de la conducta',
  })
  desglose_trimestral: {
    trimestre_1: TrimestralDesglose;
    trimestre_2: TrimestralDesglose;
    trimestre_3: TrimestralDesglose;
    trimestre_4: TrimestralDesglose;
  };
}

export class TrimestralDesglose {
  @ApiProperty({
    description: 'Total de ausencias injustificadas del trimestre',
    example: 1,
  })
  total_injustificadas: number;

  @ApiProperty({
    description: 'Total de infracciones menos graves del trimestre',
    example: 2,
  })
  total_menos_graves: number;

  @ApiProperty({
    description: 'Total de infracciones graves del trimestre',
    example: 1,
  })
  total_graves: number;

  @ApiProperty({
    description: 'Total de infracciones muy graves del trimestre',
    example: 0,
  })
  total_muy_graves: number;

  @ApiProperty({
    description: 'Puntuación de conducta del trimestre',
    example: 8.8,
  })
  puntuacion: number;
}
