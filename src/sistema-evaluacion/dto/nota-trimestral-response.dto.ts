import { ApiProperty } from '@nestjs/swagger';

export class NotaMensualDetalle {
  @ApiProperty({ example: 'Febrero' })
  mes: string;

  @ApiProperty({ example: 8.47 })
  nota_mensual: number;

  @ApiProperty({ example: 28 })
  porcentaje: number;

  @ApiProperty({ example: 2.37 })
  aporte: number;
}

export class NotaTrimestralResponseDto {
  @ApiProperty({ example: 1 })
  id_alumno: number;

  @ApiProperty({ example: 1 })
  id_asignatura: number;

  @ApiProperty({ example: 1 })
  trimestre: number;

  @ApiProperty({ example: '2025' })
  anio_academico: string;

  @ApiProperty({
    type: [NotaMensualDetalle],
    description: 'Detalle de notas mensuales que componen el trimestre',
  })
  notas_mensuales: NotaMensualDetalle[];

  @ApiProperty({
    example: 7.85,
    description: 'Nota final del trimestre (suma de aportes)',
  })
  nota_trimestral: number;

  @ApiProperty({
    example: new Date(),
    description: 'Fecha de cálculo',
  })
  fecha_calculo: Date;
}
