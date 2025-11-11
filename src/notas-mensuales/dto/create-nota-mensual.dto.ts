import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsInt,
} from 'class-validator';

export class CreateNotaMensualDto {
  @ApiProperty({
    description: 'ID del alumno',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del alumno es requerido' })
  @IsInt({ message: 'El ID del alumno debe ser un número entero' })
  id_alumno: number;

  @ApiProperty({
    description: 'ID de la asignatura',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID de la asignatura es requerido' })
  @IsInt({ message: 'El ID de la asignatura debe ser un número entero' })
  id_asignatura: number;

  @ApiProperty({
    description: 'Mes (1-12)',
    example: 3,
    minimum: 1,
    maximum: 12,
  })
  @IsNotEmpty({ message: 'El mes es requerido' })
  @IsInt({ message: 'El mes debe ser un número entero' })
  @Min(1, { message: 'El mes debe ser entre 1 y 12' })
  @Max(12, { message: 'El mes debe ser entre 1 y 12' })
  mes: number;

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
    description: 'Nota de Tarea 1 (0-10)',
    example: 8.5,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Tarea 1 debe ser un número' })
  @Min(0, { message: 'La nota debe ser entre 0 y 10' })
  @Max(10, { message: 'La nota debe ser entre 0 y 10' })
  tarea_1?: number;

  @ApiProperty({
    description: 'Nota de Revisión de libros/cuadernos (0-10)',
    example: 9.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Revisión de libros/cuadernos debe ser un número' })
  @Min(0, { message: 'La nota debe ser entre 0 y 10' })
  @Max(10, { message: 'La nota debe ser entre 0 y 10' })
  revision_libros_cuadernos?: number;

  @ApiProperty({
    description: 'Nota de Tarea 2 (0-10)',
    example: 7.5,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Tarea 2 debe ser un número' })
  @Min(0, { message: 'La nota debe ser entre 0 y 10' })
  @Max(10, { message: 'La nota debe ser entre 0 y 10' })
  tarea_2?: number;

  @ApiProperty({
    description: 'Nota de Laboratorio escrito (0-10)',
    example: 8.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Laboratorio escrito debe ser un número' })
  @Min(0, { message: 'La nota debe ser entre 0 y 10' })
  @Max(10, { message: 'La nota debe ser entre 0 y 10' })
  laboratorio_escrito?: number;

  @ApiProperty({
    description: 'Nota del examen mensual (0-10)',
    example: 9.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Examen mensual debe ser un número' })
  @Min(0, { message: 'La nota debe ser entre 0 y 10' })
  @Max(10, { message: 'La nota debe ser entre 0 y 10' })
  examen_mensual?: number;
}
