import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FiltrosConductaDto {
  @ApiPropertyOptional({
    description: 'ID del curso para filtrar',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_curso?: number;

  @ApiPropertyOptional({
    description: 'Año académico para filtrar',
    example: '2025',
  })
  @IsOptional()
  @IsString()
  anio_academico?: string;

  @ApiPropertyOptional({
    description: 'Trimestre para filtrar (1-4)',
    example: 1,
    minimum: 1,
    maximum: 4,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  trimestre?: number;
}
