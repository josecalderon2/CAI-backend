import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoAsistencia } from '@prisma/client';

export class UpdateAsistenciaDto {
  @ApiPropertyOptional({
    description: 'Nuevo estado de asistencia',
    enum: EstadoAsistencia,
    example: 'TARDE',
  })
  @IsOptional()
  @IsEnum(EstadoAsistencia, {
    message: 'El estado debe ser uno de los valores válidos del enum EstadoAsistencia.',
  })
  estado?: EstadoAsistencia;

  @ApiPropertyOptional({
    description: 'Observación o nota adicional sobre la asistencia',
    example: 'El alumno presentó excusa médica',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La observación no debe superar los 255 caracteres.' })
  observacion?: string;
}
