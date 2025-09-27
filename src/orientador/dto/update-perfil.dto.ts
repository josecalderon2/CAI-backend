import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

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
    minLength: 8,
    description: 'Se re-hashéa si se envía',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
