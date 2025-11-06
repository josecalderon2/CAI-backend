import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ResumenTrimestralConsolidadoDto {
  @ApiProperty({
    description: 'ID del curso para el cual generar el reporte consolidado',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  cursoId: number;

  @ApiProperty({
    description: 'Año académico para el cual generar el reporte consolidado',
    example: 2025,
  })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  anio: number;
}
