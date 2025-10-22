import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class UpdatePerfilOrientadorDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apellido?: string;

  @ApiPropertyOptional({
    description:
      'Contraseña actual (requerida si se quiere cambiar la contraseña)',
  })
  @ValidateIf((o) => !!o.password)
  @IsString()
  currentPassword?: string;

  @ApiPropertyOptional({
    minLength: 8,
    description: 'Nueva contraseña (requiere enviar currentPassword)',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  direccion?: string;
}
