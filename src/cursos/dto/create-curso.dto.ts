import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCursoDto {
  @ApiProperty({ example: '3A' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({ example: 'Sección A' })
  @IsOptional()
  @IsString()
  seccion?: string;

  @ApiPropertyOptional({ example: 1, description: 'FK a Grado_Academico' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_grado_academico?: number;

  @ApiPropertyOptional({ example: 1, description: 'FK a Orientador' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_orientador?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cupo?: number;

  @ApiPropertyOptional({ example: 'Aula 5' })
  @IsOptional()
  @IsString()
  aula?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  activo?: boolean;
}
