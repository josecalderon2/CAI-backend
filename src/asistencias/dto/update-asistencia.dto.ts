import { IsEnum, IsOptional, IsString, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoAsistencia } from '@prisma/client';

export class UpdateAsistenciaDto {
  @ApiPropertyOptional({
    enum: EstadoAsistencia,
    description: 'Nuevo estado de la asistencia',
    example: 'E',
  })
  @IsOptional()
  @IsEnum(EstadoAsistencia)
  estado?: EstadoAsistencia;

  @ApiPropertyOptional({
    description: 'Nueva observación sobre la asistencia',
    example: 'Trajo justificación médica',
  })
  @IsOptional()
  @IsString()
  observacion?: string;

  @ApiPropertyOptional({
    description: 'ID del orientador que realiza la modificación',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  id_orientador?: number;
}
