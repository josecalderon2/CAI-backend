import {
  IsInt,
  IsPositive,
  IsDate,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConductaDto {
  @IsInt()
  @IsPositive()
  id_alumno: number;

  @IsInt()
  @IsPositive()
  id_infraccion_catalogo: number;

  @IsDate()
  @Type(() => Date) // Transforma el string ISO de entrada a un objeto Date
  fecha: Date;

  @IsInt()
  @IsPositive()
  @IsOptional()
  id_orientador?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  id_asignatura?: number;

  @IsString()
  @IsOptional()
  observacion?: string;

  @IsString()
  @IsOptional()
  anio_academico?: string;

  @IsInt()
  @Min(1)
  @Max(4) // Asumiendo 3 o 4 trimestres/periodos
  @IsOptional()
  trimestre?: number;
}
