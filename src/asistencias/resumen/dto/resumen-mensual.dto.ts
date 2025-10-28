import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class ResumenMensualDto {
  @ApiProperty({
    description: 'ID del curso',
    example: 1,
    type: Number,
  })
  @IsInt()
  cursoId: number;

  @ApiProperty({
    description: 'Mes del año (1-12)',
    example: 8,
    minimum: 1,
    maximum: 12,
    type: Number,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  mes: number; // 1 (Enero) - 12 (Diciembre)

  @ApiProperty({
    description: 'Año académico',
    example: 2025,
    minimum: 2020,
    maximum: 2100,
    type: Number,
  })
  @IsInt()
  @Min(2020)
  @Max(2100)
  anio: number;
}
