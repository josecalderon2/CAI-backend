import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBooleanString,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  IsIn,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export enum EstadoAsignacion {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  FINALIZADO = 'FINALIZADO',
}

export class ListDtoExt {
  @ApiPropertyOptional({ description: 'Texto libre para buscar' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Página (1..n)', example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Tamaño de página', example: 20 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ enum: EstadoAsignacion })
  @IsOptional()
  @IsEnum(EstadoAsignacion)
  estado?: EstadoAsignacion;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(1)
  id_orientador?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(1)
  id_asignatura?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(1)
  id_curso?: number;

  @ApiPropertyOptional({ description: 'Año académico', example: '2026' })
  @IsOptional()
  @IsString()
  anio_academico?: string;

  @ApiPropertyOptional({ description: 'Usar materialized view', type: Boolean })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  use_mv?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar solo casos donde es orientador',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  soloOrientador?: boolean;
}
