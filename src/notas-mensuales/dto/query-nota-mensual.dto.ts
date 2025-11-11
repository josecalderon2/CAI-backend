import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryNotaMensualDto {
  @ApiPropertyOptional({
    description: 'ID del alumno',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del alumno debe ser un número entero' })
  id_alumno?: number;

  @ApiPropertyOptional({
    description: 'ID de la asignatura',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID de la asignatura debe ser un número entero' })
  id_asignatura?: number;

  @ApiPropertyOptional({
    description: 'Mes (1-12)',
    example: 3,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El mes debe ser un número entero' })
  @Min(1, { message: 'El mes debe ser entre 1 y 12' })
  @Max(12, { message: 'El mes debe ser entre 1 y 12' })
  mes?: number;

  @ApiPropertyOptional({
    description: 'Año académico',
    example: 2025,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(2020, { message: 'El año debe ser mayor a 2020' })
  @Max(2100, { message: 'El año debe ser menor a 2100' })
  anio?: number;
}
