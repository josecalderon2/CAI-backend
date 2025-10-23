import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, IsInt } from 'class-validator';
import { EstadoAsistencia } from '@prisma/client';

export class UpdateAsistenciaDto {
  @ApiPropertyOptional({
    description: 'Nuevo estado de asistencia (P, E, SP o A)',
    enum: EstadoAsistencia,
    example: 'SP',
  })
  @IsOptional()
  @IsEnum(EstadoAsistencia, {
    message: 'El estado debe ser uno de los valores válidos del enum EstadoAsistencia (P, E, SP o A).',
  })
  estado?: EstadoAsistencia;

  @ApiPropertyOptional({
    description: 'Observación o nota adicional sobre la asistencia',
    example: 'El alumno presentó excusa médica.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La observación no debe superar los 255 caracteres.' })
  observacion?: string;

  @ApiPropertyOptional({
    description: 'Trimestre actualizado (1, 2 o 3)',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  trimestre?: number;
}
