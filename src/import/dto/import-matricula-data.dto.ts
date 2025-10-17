// src/import/dto/import-matricula-data.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class ResponsableDataDto {
  @IsString() @IsOptional() r_apellido?: string;
  @IsString() @IsOptional() r_nombre?: string;
  @IsString() @IsOptional() r_dui?: string;
  @IsString() @IsOptional() r_email?: string;
  @IsString() @IsOptional() r_telefono?: string;
  @IsString() @IsOptional() r_telefono_fijo?: string;
  @IsString() @IsOptional() r_parentesco?: string;
  @IsString() @IsOptional() r_tipo_documento?: string;
  @IsString() @IsOptional() r_numero_documento?: string;
  @IsBoolean() @IsOptional() r_naturalizado?: boolean;

  @IsBoolean() @IsOptional() r_contacto_emergencia?: boolean;
  @IsBoolean() @IsOptional() r_permita_traslado?: boolean;
  @IsBoolean() @IsOptional() r_puede_retirar?: boolean;
  @IsBoolean() @IsOptional() r_firma?: boolean;
}

class AlumnoDataDto {
  @IsString() @IsOptional() numero_matricula?: string;
  @IsString() @IsOptional() anio_escolar?: string;
  @IsString() @IsOptional() estado_matricula?: string; // INSCRITO / RETIRADO / etc.
  @IsString() @IsOptional() fecha_matricula?: string; // 'DD/MM/YYYY' o ISO

  @IsString() @IsOptional() nombre?: string;
  @IsString() @IsOptional() apellido?: string;
  @IsString() @IsOptional() genero?: string;
  @IsString() @IsOptional() fecha_nacimiento?: string; // 'DD/MM/YYYY'

  @IsString() @IsOptional() nacionalidad?: string;
  @IsString() @IsOptional() tipo_sangre?: string;
  @IsString() @IsOptional() religion?: string;

  @IsString() @IsOptional() direccion?: string;
  @IsString() @IsOptional() municipio?: string;
  @IsString() @IsOptional() departamento?: string;
  @IsBoolean() @IsOptional() repite_grado?: boolean;
  @IsBoolean() @IsOptional() condicionado?: boolean;

  // Transporte / vivienda / emergencias
  @IsBoolean() @IsOptional() usa_transporte_escolar?: boolean;
  @IsString() @IsOptional() medio_transporte?: string;
  @IsString() @IsOptional() encargado_transporte?: string;
  @IsString() @IsOptional() encargado_telefono?: string;
  @IsString() @IsOptional() tenencia_vivienda?: string;

  @IsString() @IsOptional() emergencia1_nombre?: string;
  @IsString() @IsOptional() emergencia1_parentesco?: string;
  @IsString() @IsOptional() emergencia1_telefono?: string;
  @IsString() @IsOptional() emergencia2_nombre?: string;
  @IsString() @IsOptional() emergencia2_parentesco?: string;
  @IsString() @IsOptional() emergencia2_telefono?: string;

  // Autorizaciones
  @IsBoolean() @IsOptional() autoriza_atencion_medica?: boolean;
  @IsBoolean() @IsOptional() autoriza_uso_imagen?: boolean;
  @IsBoolean() @IsOptional() autoriza_actividades_religiosas?: boolean;

  // Responsable(s)
  @ValidateNested()
  @Type(() => ResponsableDataDto)
  @IsOptional()
  responsable_principal?: ResponsableDataDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponsableDataDto)
  @IsOptional()
  responsables?: ResponsableDataDto[];
}

export class ImportMatriculaDataDto {
  @ValidateNested({ each: true })
  @Type(() => AlumnoDataDto)
  data: AlumnoDataDto[];
}
