// src/alumnos/dto/update-alumno.dto.ts
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
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AlumnoDetalleDto, ResponsableDto } from './create-alumno.dto';

export class UpdateAlumnoDto {
  @ApiPropertyOptional() @IsOptional() @IsString() photo?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() nombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() apellido?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() genero?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() fechaNacimiento?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nacionalidad?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^[0-9]{8}$/)
  telefono?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  edad?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() partidaNumero?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() folio?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() libro?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() anioPartida?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departamentoNacimiento?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() municipioNacimiento?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() tipoSangre?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() problemaFisico?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacionesMedicas?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() centroAsistencial?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() medicoNombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^[0-9]{8}$/)
  medicoTelefono?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() zonaResidencia?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() direccion?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() departamento?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() municipio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  distanciaKM?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() medioTransporte?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() firmaPadre?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() firmaMadre?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() firmaResponsable?: boolean;

  @ApiPropertyOptional({ description: 'Permite cambiar estado' })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

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
