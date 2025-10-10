import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGradoAcademicoDto {
  @ApiProperty({ example: '3º Básico' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({ example: 'Diurno' })
  @IsOptional()
  @IsString()
  opcion?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  n_anios?: number;

  @ApiPropertyOptional({ example: 70 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  nota_minima?: number;

  @ApiPropertyOptional({ example: 1, description: 'FK a jornada' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_jornada?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  rcup?: boolean;
}
