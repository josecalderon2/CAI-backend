import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateResponsableDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  apellido: string;

  @IsOptional()
  @IsString()
  dui?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  lugarTrabajo?: string;

  @IsOptional()
  @IsString()
  profesionOficio?: string;

  @IsOptional()
  @IsString()
  ultimoGradoEstudiado?: string;

  @IsOptional()
  @IsString()
  ocupacion?: string;

  @IsOptional()
  @IsString()
  religion?: string;

  @IsOptional()
  @IsString()
  zonaResidencia?: string;

  @IsOptional()
  @IsString()
  estadoFamiliar?: string;

  @IsOptional()
  @IsString()
  empresaTransporte?: string;

  @IsOptional()
  @IsString()
  placaVehiculo?: string;

  @IsOptional()
  @IsString()
  tipoVehiculo?: string;

  // No incluimos firmaFoto aquí, se manejará por separado para mayor eficiencia
}
