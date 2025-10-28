import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class ResumenTrimestralDto {
  @ApiProperty({
    description: 'ID del curso',
    example: 1,
    type: Number,
  })
  @IsInt()
  cursoId: number;

  @ApiProperty({
    description: 'Número del trimestre (1-4)',
    example: 3,
    minimum: 1,
    maximum: 4,
    type: Number,
  })
  @IsInt()
  @Min(1)
  @Max(4)
  trimestre: number;

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
