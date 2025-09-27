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
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** ====== RELACIONES ====== **/
export class ResponsableDto {
  @ApiProperty() @IsString() nombre: string;
  @ApiProperty() @IsString() apellido: string;

  @ApiProperty({ example: '01234567-8' })
  @Matches(/^\d{8}-\d$/, { message: 'Formato de DUI inválido' })
  dui: string;

  @ApiProperty({ example: '77777777' })
  @Matches(/^\d{8}$/, { message: 'Teléfono debe tener 8 dígitos' })
  telefono: string;

  @ApiProperty() @IsEmail() email: string;

  @ApiProperty({
    enum: ['Padre', 'Madre', 'Responsable', 'EncargadoTransporte'],
  })
  @IsString()
  tipo: string;

  @ApiProperty() @IsDateString() fechaNacimiento: string;
  @ApiProperty() @IsString() departamentoNacimiento: string;
  @ApiProperty() @IsString() municipioNacimiento: string;
  @ApiProperty() @IsString() estadoFamiliar: string;
  @ApiProperty() @IsString() zonaResidencia: string;
  @ApiProperty() @IsString() direccion: string;
  @ApiProperty() @IsString() profesion: string;
  @ApiProperty() @IsString() ultimoGradoEstudiado: string;
  @ApiProperty() @IsString() ocupacion: string;
  @ApiProperty() @IsString() religion: string;

  @ApiProperty() @IsBoolean() firmaFoto: boolean;
}

export class AlumnoDetalleDto {
  @ApiProperty() @IsString() repiteGrado: string;
  @ApiProperty() @IsString() condicionado: string;

  @ApiPropertyOptional() @IsOptional() @IsString() enfermedades?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  medicamentoPrescrito?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observaciones?: string;

  @ApiProperty() @IsBoolean() capacidadPago: boolean;
  @ApiProperty() @IsBoolean() tieneHermanos: boolean;

  @ApiPropertyOptional({ description: 'Detalle en formato JSON' })
  @IsOptional()
  detalleHermanos?: any;

  @ApiPropertyOptional() @IsOptional() @IsString() viveCon?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dependenciaEconomica?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() custodiaLegal?: string;
}

/** ====== ALUMNO (CREATE) ====== **/
export class CreateAlumnoDto {
  @ApiPropertyOptional() @IsOptional() @IsString() photo?: string;

  @ApiProperty() @IsString() nombre: string;
  @ApiProperty() @IsString() apellido: string;

  @ApiProperty() @IsString() genero: string;
  @ApiProperty() @IsDateString() fechaNacimiento: string;
  @ApiProperty() @IsString() nacionalidad: string;

  @ApiProperty()
  @Matches(/^\d{8}$/, { message: 'Teléfono debe tener 8 dígitos' })
  telefono: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  edad?: number;

  @ApiProperty() @IsString() partidaNumero: string;
  @ApiProperty() @IsString() folio: string;
  @ApiProperty() @IsString() libro: string;
  @ApiProperty() @IsString() anioPartida: string;

  @ApiProperty() @IsString() departamentoNacimiento: string;
  @ApiProperty() @IsString() municipioNacimiento: string;

  @ApiProperty() @IsString() tipoSangre: string;
  @ApiProperty() @IsString() problemaFisico: string;
  @ApiProperty() @IsString() observacionesMedicas: string;

  @ApiProperty() @IsString() centroAsistencial: string;
  @ApiProperty() @IsString() medicoNombre: string;

  @ApiProperty({ example: '77777777' })
  @Matches(/^\d{8}$/, { message: 'Teléfono debe tener 8 dígitos' })
  medicoTelefono: string;

  @ApiProperty() @IsString() zonaResidencia: string;
  @ApiProperty() @IsString() direccion: string;

  @ApiProperty() @IsString() departamento: string;
  @ApiProperty() @IsString() municipio: string;

  @ApiProperty() @Type(() => Number) @IsNumber() distanciaKM: number;
  @ApiProperty() @IsString() medioTransporte: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() firmaPadre?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() firmaMadre?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() firmaResponsable?: boolean;

  @ApiPropertyOptional({ type: () => AlumnoDetalleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AlumnoDetalleDto)
  alumnoDetalle?: AlumnoDetalleDto;

  @ApiPropertyOptional({ type: () => [ResponsableDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponsableDto)
  responsables?: ResponsableDto[];
}
