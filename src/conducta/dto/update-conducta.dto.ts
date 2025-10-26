import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateConductaDto {
  @ApiPropertyOptional({
    example: 'GRAVE',
    description: 'Nueva gravedad (MENOS_GRAVE, GRAVE o MUY_GRAVE)',
  })
  @IsOptional()
  @IsEnum(['MENOS_GRAVE', 'GRAVE', 'MUY_GRAVE'], {
    message: 'La gravedad debe ser MENOS_GRAVE, GRAVE o MUY_GRAVE',
  })
  gravedad?: 'MENOS_GRAVE' | 'GRAVE' | 'MUY_GRAVE';

  @ApiPropertyOptional({
    example: 'El alumno interrumpió nuevamente la clase.',
    description: 'Nueva descripción o nota de la conducta',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La descripción no debe superar los 255 caracteres' })
  descripcion?: string;
}
