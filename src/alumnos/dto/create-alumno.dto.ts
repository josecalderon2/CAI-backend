import {
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  IsBoolean,
  ValidateNested,
  IsArray,
  IsNumber,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';

/** ====== RELACIONES ====== **/
export class ResponsableDto {
  @IsString() nombre: string;
  @IsString() apellido: string;

  @IsString() dui: string;
  @IsString() telefono: string;
  @IsEmail() email: string;

  // "Padre" | "Madre" | "Responsable" | "EncargadoTransporte"
  @IsString() tipo: string;

  @IsDateString() fechaNacimiento: string;
  @IsString() departamentoNacimiento: string;
  @IsString() municipioNacimiento: string;
  @IsString() estadoFamiliar: string;
  @IsString() zonaResidencia: string;
  @IsString() direccion: string;
  @IsString() profesion: string;
  @IsString() ultimoGradoEstudiado: string;
  @IsString() ocupacion: string;
  @IsString() religion: string;
  @IsBoolean() firmaFoto: boolean;
}

export class AlumnoDetalleDto {
  @IsString() repiteGrado: string;
  @IsString() condicionado: string;

  @IsOptional() @IsString() enfermedades?: string;
  @IsOptional() @IsString() medicamentoPrescrito?: string;
  @IsOptional() @IsString() observaciones?: string;

  @IsBoolean() capacidadPago: boolean;
  @IsBoolean() tieneHermanos: boolean;

  // Json
  @IsOptional() detalleHermanos?: any;
  @IsOptional() @IsString() viveCon?: string;
  @IsOptional() @IsString() dependenciaEconomica?: string;
  @IsOptional() @IsString() custodiaLegal?: string;
}

/** ====== ALUMNO (CREATE) ====== **/
export class CreateAlumnoDto {
  // schema: photo String?
  @IsOptional() @IsString() photo?: string;

  @IsString() nombre: string;
  @IsString() apellido: string;

  @IsString() genero: string;
  @IsDateString() fechaNacimiento: string;
  @IsString() nacionalidad: string;
  @IsString() telefono: string;

  @IsOptional() @Type(() => Number) @IsInt() edad?: number;

  @IsString() partidaNumero: string;
  @IsString() folio: string;
  @IsString() libro: string;
  @IsString() anioPartida: string;

  @IsString() departamentoNacimiento: string;
  @IsString() municipioNacimiento: string;

  @IsString() tipoSangre: string;
  @IsString() problemaFisico: string;
  @IsString() observacionesMedicas: string;

  @IsString() centroAsistencial: string;
  @IsString() medicoNombre: string;
  @IsString() medicoTelefono: string;

  @IsString() zonaResidencia: string;
  @IsString() direccion: string;

  @IsString() departamento: string;
  @IsString() municipio: string;

  @Type(() => Number) @IsNumber() distanciaKM: number;
  @IsString() medioTransporte: string;

  // en schema default(false) → opcionales
  @IsOptional() @IsBoolean() firmaPadre?: boolean;
  @IsOptional() @IsBoolean() firmaMadre?: boolean;
  @IsOptional() @IsBoolean() firmaResponsable?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => AlumnoDetalleDto)
  alumnoDetalle?: AlumnoDetalleDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponsableDto)
  responsables?: ResponsableDto[];
}

/** ====== ALUMNO (UPDATE) ====== **/
export class UpdateAlumnoDto {
  // schema: photo String?
  @IsOptional() @IsString() photo?: string;

  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() apellido?: string;

  @IsOptional() @IsString() genero?: string;
  @IsOptional() @IsDateString() fechaNacimiento?: string;
  @IsOptional() @IsString() nacionalidad?: string;
  @IsOptional() @IsString() telefono?: string;

  @IsOptional() @Type(() => Number) @IsInt() edad?: number;

  @IsOptional() @IsString() partidaNumero?: string;
  @IsOptional() @IsString() folio?: string;
  @IsOptional() @IsString() libro?: string;
  @IsOptional() @IsString() anioPartida?: string;

  @IsOptional() @IsString() departamentoNacimiento?: string;
  @IsOptional() @IsString() municipioNacimiento?: string;

  @IsOptional() @IsString() tipoSangre?: string;
  @IsOptional() @IsString() problemaFisico?: string;
  @IsOptional() @IsString() observacionesMedicas?: string;

  @IsOptional() @IsString() centroAsistencial?: string;
  @IsOptional() @IsString() medicoNombre?: string;
  @IsOptional() @IsString() medicoTelefono?: string;

  @IsOptional() @IsString() zonaResidencia?: string;
  @IsOptional() @IsString() direccion?: string;

  @IsOptional() @IsString() departamento?: string;
  @IsOptional() @IsString() municipio?: string;

  @IsOptional() @Type(() => Number) @IsNumber() distanciaKM?: number;
  @IsOptional() @IsString() medioTransporte?: string;

  @IsOptional() @IsBoolean() firmaPadre?: boolean;
  @IsOptional() @IsBoolean() firmaMadre?: boolean;
  @IsOptional() @IsBoolean() firmaResponsable?: boolean;

  // permitir cambiar estado desde update (opcional)
  @IsOptional() @IsBoolean() activo?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => AlumnoDetalleDto)
  alumnoDetalle?: AlumnoDetalleDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponsableDto)
  responsables?: ResponsableDto[];
}
