import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateOrientadorDto } from './create-orientador.dto';
import { IsOptional, IsString, MinLength, IsBoolean } from 'class-validator';

export class UpdateOrientadorDto extends PartialType(CreateOrientadorDto) {
  @ApiPropertyOptional({ minLength: 8 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
