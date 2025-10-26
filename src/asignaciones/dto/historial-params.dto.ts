import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class HistorialParamsDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  id_curso?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  id_orientador?: number;

  @IsOptional()
  @ValidateIf((o) => o.id_asignatura !== undefined) 
  @IsInt({ each: false })
  @IsPositive()
  @Transform(({ value }) => value) 
  id_asignatura?: number | null;

  @IsOptional()
  @ValidateIf((o) => o.anio_academico !== undefined) 
  @IsString()
  anio_academico?: string | null;

  @IsOptional()
  @IsBoolean()
  es_orientador?: boolean;

  @IsOptional()
  @IsIn(['abierto', 'cerrado'])
  estado?: 'abierto' | 'cerrado';

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' || value === true ? true : undefined,
  )
  @IsBoolean()
  all?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
