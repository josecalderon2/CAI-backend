import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoAsistencia } from '@prisma/client';

export class CreateAsistenciaDto {
  @IsInt()
  @IsPositive()
  id_alumno: number;

  @IsInt()
  @IsPositive()
  id_asignatura: number;

  @IsInt()
  @IsPositive()
  id_orientador: number; // El docente/orientador que toma la asistencia

  @IsDate()
  @Type(() => Date) // Transforma el string ISO a un objeto Date
  fecha: Date;

  @IsEnum(EstadoAsistencia)
  estado: EstadoAsistencia; // 'P', 'E', 'SP', 'A'

  @IsString()
  @IsOptional()
  observacion?: string;

  @IsString()
  @IsOptional()
  anio_academico?: string;

  @IsInt()
  @IsOptional()
  trimestre?: number;
}
