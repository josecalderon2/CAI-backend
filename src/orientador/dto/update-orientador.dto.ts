import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateOrientadorDto } from './create-orientador.dto';
import { IsOptional, IsString, MinLength, IsBoolean } from 'class-validator';

export class UpdateOrientadorDto extends PartialType(CreateOrientadorDto) {


  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
