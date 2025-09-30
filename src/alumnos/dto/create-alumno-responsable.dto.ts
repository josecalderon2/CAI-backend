import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateResponsableDto } from '../../responsables/dto';

export class CreateAlumnoResponsableDto {
  @IsOptional()
  @IsNumber()
  responsableId?: number; // Opcional: para vincular a un responsable existente

  @IsOptional()
  datosResponsable?: CreateResponsableDto; // Para crear un nuevo responsable

  @IsOptional()
  @IsNumber()
  parentescoId?: number;

  @IsOptional()
  @IsString()
  parentescoLibre?: string;

  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;

  @IsOptional()
  @IsBoolean()
  firma?: boolean;

  @IsOptional()
  @IsBoolean()
  permiteTraslado?: boolean;

  @IsOptional()
  @IsBoolean()
  puedeRetirarAlumno?: boolean;

  @IsOptional()
  @IsBoolean()
  contactoEmergencia?: boolean;
}
