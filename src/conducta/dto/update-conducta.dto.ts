import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateConductaDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Nuevo ID de la infracción del catálogo',
  })
  @IsOptional()
  @IsInt({ message: 'El ID de la infracción debe ser un número entero' })
  id_infraccion?: number;

  @ApiPropertyOptional({
    example: 'El alumno interrumpió nuevamente la clase.',
    description: 'Nueva descripción o nota de la conducta',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, {
    message: 'La descripción no debe superar los 255 caracteres',
  })
  descripcion?: string;
}
