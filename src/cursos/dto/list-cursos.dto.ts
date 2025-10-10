import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ListCursosDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Buscar por nombre, aula, orientador, etc.',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filtrar por id_grado_academico' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_grado_academico?: number;

  @ApiPropertyOptional({ description: 'Filtrar por modalidad (si aplica)' })
  @IsOptional()
  @IsString()
  modalidad?: string;

  @ApiPropertyOptional({ description: 'Filtrar por activo true/false' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activo?: boolean;
}
