import { PartialType } from '@nestjs/swagger';
import { CreateAdministrativoDto } from './create-administrativo.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, IsBoolean } from 'class-validator';

export class UpdateAdministrativoDto extends PartialType(
  CreateAdministrativoDto,
) {
 
  @ApiPropertyOptional({
    description: 'Permite activar/desactivar (soft delete)',
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
