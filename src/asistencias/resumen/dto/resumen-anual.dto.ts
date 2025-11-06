import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ResumenAnualDto {
  @ApiProperty({
    description: 'ID del curso',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  cursoId: number;

  @ApiProperty({
    description: 'Año académico',
    example: 2025,
  })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  anio: number;
}
