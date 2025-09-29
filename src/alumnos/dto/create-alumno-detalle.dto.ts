import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAlumnoDetalleDto {
  @IsOptional()
  @IsString()
  viveCon?: string;

  @IsOptional()
  @IsString()
  dependenciaEconomica?: string;

  @IsOptional()
  @IsBoolean()
  capacidadPago?: boolean;

  @IsOptional()
  @IsBoolean()
  tieneHermanosEnColegio?: boolean;

  @IsOptional()
  hermanosEnColegio?: any; // Estructura: [{nombre: string, grado: string}]
}
