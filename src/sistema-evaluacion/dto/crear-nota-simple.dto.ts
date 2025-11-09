import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsInt,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para actividad individual en formato simplificado
 */
class ActividadSimpleDto {
  @ApiProperty({
    description: 'ID del tipo de actividad',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del tipo de actividad es requerido' })
  @IsInt({ message: 'El ID del tipo de actividad debe ser un número entero' })
  id_tipo_actividad: number;

  @ApiProperty({
    description:
      'Número de actividad (para tipos que permiten múltiples instancias como Tarea 1, Tarea 2)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El número de actividad debe ser un número entero' })
  numero_actividad?: number;

  @ApiProperty({
    description: 'Nota de la actividad (0-10)',
    example: 8.5,
  })
  @IsNotEmpty({ message: 'La nota es requerida' })
  @IsNumber({}, { message: 'La nota debe ser un número' })
  @Min(0, { message: 'La nota debe ser entre 0 y 10' })
  @Max(10, { message: 'La nota debe ser entre 0 y 10' })
  nota: number;
}

/**
 * DTO simplificado para crear notas mensuales
 * Usa mes numérico (1-12) y año numérico para mayor facilidad en el frontend
 */
export class CrearNotaSimpleDto {
  @ApiProperty({
    description: 'ID del alumno',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del alumno es requerido' })
  @IsInt({ message: 'El ID del alumno debe ser un número entero' })
  id_alumno: number;

  @ApiProperty({
    description: 'ID de la asignatura',
    example: 2,
  })
  @IsNotEmpty({ message: 'El ID de la asignatura es requerido' })
  @IsInt({ message: 'El ID de la asignatura debe ser un número entero' })
  id_asignatura: number;

  @ApiProperty({
    description: 'Mes numérico (1-12)',
    example: 2,
    minimum: 1,
    maximum: 12,
  })
  @IsNotEmpty({ message: 'El mes es requerido' })
  @IsInt({ message: 'El mes debe ser un número entero' })
  @Min(1, { message: 'El mes debe ser entre 1 y 12' })
  @Max(12, { message: 'El mes debe ser entre 1 y 12' })
  mes_numerico: number;

  @ApiProperty({
    description: 'Año académico',
    example: 2025,
  })
  @IsNotEmpty({ message: 'El año es requerido' })
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(2020, { message: 'El año debe ser mayor a 2020' })
  @Max(2100, { message: 'El año debe ser menor a 2100' })
  anio: number;

  @ApiProperty({
    description: 'Número de trimestre o periodo (1-4)',
    example: 1,
    minimum: 1,
    maximum: 4,
  })
  @IsNotEmpty({ message: 'El trimestre/periodo es requerido' })
  @IsInt({ message: 'El trimestre debe ser un número entero' })
  @Min(1, { message: 'El trimestre debe ser entre 1 y 4' })
  @Max(4, { message: 'El trimestre debe ser entre 1 y 4' })
  trimestre: number;

  @ApiProperty({
    description: 'Lista de actividades con sus notas',
    type: [ActividadSimpleDto],
    example: [
      { id_tipo_actividad: 1, numero_actividad: 1, nota: 8.5 },
      { id_tipo_actividad: 2, numero_actividad: null, nota: 9.0 },
    ],
  })
  @IsNotEmpty({ message: 'Debe incluir al menos una actividad' })
  @IsArray({ message: 'Las actividades deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => ActividadSimpleDto)
  actividades: ActividadSimpleDto[];

  @ApiProperty({
    description: 'Nota del examen mensual/periodo (0-10)',
    example: 9.0,
  })
  @IsNotEmpty({ message: 'El examen mensual es requerido' })
  @IsNumber({}, { message: 'El examen mensual debe ser un número' })
  @Min(0, { message: 'La nota debe ser entre 0 y 10' })
  @Max(10, { message: 'La nota debe ser entre 0 y 10' })
  examen_mensual: number;

  @ApiProperty({
    description:
      'Nota del examen parcial (0-10) - Solo para Bachillerato, opcional para Básica',
    example: 8.5,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El examen parcial debe ser un número' })
  @Min(0, { message: 'La nota debe ser entre 0 y 10' })
  @Max(10, { message: 'La nota debe ser entre 0 y 10' })
  examen_parcial?: number;
}
