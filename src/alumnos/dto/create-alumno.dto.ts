import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateAlumnoDetalleDto } from './create-alumno-detalle.dto';
import { CreateAlumnoResponsableDto } from './create-alumno-responsable.dto';

export class CreateAlumnoDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  apellido: string;

  @IsOptional()
  @IsString()
  genero?: string;

  @IsOptional()
  @IsString()
  fechaNacimiento?: string; // formato DD/MM/YYYY

  @IsOptional()
  @IsString()
  nacionalidad?: string;

  @IsOptional()
  @IsNumber()
  edad?: number;

  @IsOptional()
  @IsString()
  partidaNumero?: string;

  @IsOptional()
  @IsString()
  folio?: string;

  @IsOptional()
  @IsString()
  libro?: string;

  @IsOptional()
  @IsString()
  anioPartida?: string;

  @IsOptional()
  @IsString()
  departamentoNacimiento?: string;

  @IsOptional()
  @IsString()
  municipioNacimiento?: string;

  @IsOptional()
  @IsString()
  tipoSangre?: string;

  @IsOptional()
  @IsString()
  problemaFisico?: string;

  @IsOptional()
  @IsString()
  observacionesMedicas?: string;

  @IsOptional()
  @IsString()
  centroAsistencial?: string;

  @IsOptional()
  @IsString()
  medicoNombre?: string;

  @IsOptional()
  @IsString()
  medicoTelefono?: string;

  @IsOptional()
  @IsString()
  zonaResidencia?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  municipio?: string;

  @IsOptional()
  @IsString()
  departamento?: string;

  @IsOptional()
  @IsNumber()
  distanciaKM?: number;

  @IsOptional()
  @IsString()
  medioTransporte?: string;

  @IsOptional()
  @IsString()
  encargadoTransporte?: string;

  @IsOptional()
  @IsString()
  encargadoTelefono?: string;

  @IsOptional()
  @IsBoolean()
  repiteGrado?: boolean;

  @IsOptional()
  @IsBoolean()
  condicionado?: boolean;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAlumnoDetalleDto)
  detalle?: CreateAlumnoDetalleDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAlumnoResponsableDto)
  responsables?: CreateAlumnoResponsableDto[];
}
