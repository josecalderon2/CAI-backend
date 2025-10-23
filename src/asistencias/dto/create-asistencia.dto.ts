import { ApiProperty } from '@nestjs/swagger';
import { EstadoAsistencia } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAsistenciaDto {
  @ApiProperty({ description: 'ID del alumno', example: 12 })
  @IsInt()
  id_alumno: number;

  @ApiProperty({ description: 'ID de la asignatura', example: 4 })
  @IsInt()
  id_asignatura: number;

  @ApiProperty({ description: 'ID del orientador que registra la asistencia', example: 7 })
  @IsInt()
  id_orientador: number;

  @ApiProperty({
    description: 'Fecha del registro de asistencia (formato ISO o YYYY-MM-DD)',
    example: '2025-10-22',
  })
  @IsDateString()
  fecha: string;

  @ApiProperty({
    enum: EstadoAsistencia,
    description: 'Estado de la asistencia (P, E, SP o A)',
    example: 'P',
  })
  @IsEnum(EstadoAsistencia, {
    message: 'El estado debe ser uno de los valores: P, E, SP o A.',
  })
  estado: EstadoAsistencia;

  @ApiProperty({
    description: 'Observación opcional (comentario del docente)',
    example: 'Llegó puntual y con uniforme completo.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La observación no debe superar los 255 caracteres.' })
  observacion?: string;

  @ApiProperty({
    description: 'Año académico actual (opcional)',
    example: '2025',
    required: false,
  })
  @IsOptional()
  @IsString()
  anio_academico?: string;

  @ApiProperty({
    description: 'Trimestre (1, 2 o 3)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  trimestre?: number;
}
