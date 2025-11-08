import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsInt,
  IsIn,
  IsString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateActividadEvaluacionDto } from './create-actividad-evaluacion.dto';

export class CalcularNotaMensualDto {
  @ApiProperty({
    description: 'ID del alumno',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del alumno es requerido' })
  @IsInt()
  id_alumno: number;

  @ApiProperty({
    description: 'ID de la asignatura',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID de la asignatura es requerido' })
  @IsInt()
  id_asignatura: number;

  @ApiProperty({
    description:
      'Mes o periodo de la evaluación. BÁSICA: Febrero-Octubre. BACHILLERATO: Periodo 1-4',
    example: 'Febrero',
    enum: [
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Periodo 1',
      'Periodo 2',
      'Periodo 3',
      'Periodo 4',
    ],
  })
  @IsNotEmpty({ message: 'El mes es requerido' })
  @IsString()
  @IsIn([
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Periodo 1',
    'Periodo 2',
    'Periodo 3',
    'Periodo 4',
  ])
  mes: string;

  @ApiProperty({
    description:
      'Trimestre o periodo al que pertenece. BÁSICA: 1-3. BACHILLERATO: 1-4',
    example: 1,
    minimum: 1,
    maximum: 4,
  })
  @IsNotEmpty({ message: 'El trimestre es requerido' })
  @IsInt()
  @Min(1, { message: 'El trimestre/periodo mínimo es 1' })
  @Max(4, { message: 'El trimestre/periodo máximo es 4' })
  trimestre: number;

  @ApiProperty({
    description: 'Año académico',
    example: '2025',
  })
  @IsNotEmpty({ message: 'El año académico es requerido' })
  @IsString()
  anio_academico: string;

  @ApiProperty({
    description: 'Lista de actividades de aprendizaje continuo (70%)',
    type: [CreateActividadEvaluacionDto],
    example: [
      { nombre: 'Tarea 1', nota: 8.0 },
      { nombre: 'Revisión de libros y cuadernos', nota: 9.0 },
      { nombre: 'Tarea 2', nota: 7.5 },
      { nombre: 'Laboratorio escrito', nota: 8.5 },
    ],
  })
  @IsNotEmpty({ message: 'Las actividades son requeridas' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActividadEvaluacionDto)
  actividades: CreateActividadEvaluacionDto[];

  @ApiProperty({
    description:
      'Nota del examen mensual (30% Básica / 30% del periodo Bachillerato)',
    example: 9.0,
    minimum: 0,
    maximum: 10,
  })
  @IsNotEmpty({ message: 'La nota del examen mensual es requerida' })
  @IsNumber()
  @Min(0, { message: 'La nota mínima del examen es 0' })
  @Max(10, { message: 'La nota máxima del examen es 10' })
  examen_mensual: number;

  @ApiProperty({
    description:
      'Nota del examen parcial (solo para Bachillerato, 25% del periodo)',
    example: 8.5,
    minimum: 0,
    maximum: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'La nota mínima del examen parcial es 0' })
  @Max(10, { message: 'La nota máxima del examen parcial es 10' })
  examen_parcial?: number;
}
