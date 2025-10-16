// src/import/dto/import-matricula-data.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

// Definición de la estructura de un Responsable (simplificada para el DTO)
class ResponsableDataDto {
  @IsString() @IsOptional() r_apellido: string;
  @IsString() @IsOptional() r_nombre: string;
  @IsString() @IsOptional() r_dui: string;
  @IsString() @IsOptional() r_telefono: string;
  @IsString() @IsOptional() r_parentesco: string;
  @IsBoolean() @IsOptional() r_contacto_emergencia: boolean;
}

// Definición de la estructura de un Alumno (simplificada para el DTO)
class AlumnoDataDto {
  @IsString() @IsOptional() nombre: string;
  @IsString() @IsOptional() apellido: string;
  @IsString() @IsOptional() genero: string;
  @IsString() @IsOptional() fechaNacimiento: string;
  @IsString() @IsOptional() direccion: string;
  @IsString() @IsOptional() municipioResidencia: string;
  @IsString() @IsOptional() departamentoResidencia: string;
  @IsBoolean() @IsOptional() repitente: boolean;
  @IsBoolean() @IsOptional() condicionado: boolean;

  // Relación con el responsable (puede ser un objeto o un array de objetos)
  @ValidateNested()
  @Type(() => ResponsableDataDto)
  responsablePrincipal: ResponsableDataDto;
}

/**
 * DTO que recibe el array de objetos AlumnoDataDto del endpoint /persist.
 */
export class ImportMatriculaDataDto {
  @ValidateNested({ each: true })
  @Type(() => AlumnoDataDto)
  data: AlumnoDataDto[];
}
