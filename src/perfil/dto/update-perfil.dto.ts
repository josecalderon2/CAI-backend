import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePerfilDto {
  @ApiPropertyOptional({ example: 'Juan Manuel', description: 'Nuevo nombre del usuario' })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  nombre?: string;

  @ApiPropertyOptional({ example: 'Perez Gonzales', description: 'Nuevo apellido del usuario' })
  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto.' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres.' })
  apellido?: string;
}
