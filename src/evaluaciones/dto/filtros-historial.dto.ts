import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FiltrosHistorialDto {
  @ApiProperty({
    description: 'ID del tipo de evaluación para filtrar',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del tipo de evaluación debe ser un número' })
  id_tipo_evaluacion?: number;

  @ApiProperty({
    description: 'Nombre de la evaluación para buscar',
    example: 'Examen',
    required: false,
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({
    description: 'Fecha de inicio del rango (formato: YYYY-MM-DD)',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  fecha_inicio?: string;

  @ApiProperty({
    description: 'Fecha de fin del rango (formato: YYYY-MM-DD)',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  fecha_fin?: string;

  @ApiProperty({
    description: 'Página actual para la paginación',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La página debe ser un número' })
  pagina?: number;

  @ApiProperty({
    description: 'Cantidad de elementos por página',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El límite debe ser un número' })
  limite?: number;
}
