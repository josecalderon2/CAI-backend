import { ApiProperty } from '@nestjs/swagger';
import { EstadoAsistencia } from '@prisma/client';

export class CreateAsistenciaDto {
  @ApiProperty({
    description: 'ID del alumno',
    example: 12,
  })
  id_alumno: number;

  @ApiProperty({
    description: 'ID de la asignatura',
    example: 4,
  })
  id_asignatura: number;

  @ApiProperty({
    description: 'ID del docente (orientador) que registra la asistencia',
    example: 7,
  })
  id_orientador: number;

  @ApiProperty({
    description: 'Fecha del registro de asistencia (formato YYYY-MM-DD)',
    example: '2025-10-22',
  })
  fecha: string;

  @ApiProperty({
    enum: EstadoAsistencia,
    description: 'Estado de la asistencia',
    example: 'PRESENTE',
  })
  estado: EstadoAsistencia;

  @ApiProperty({
    description: 'Observación adicional (opcional)',
    example: 'Llegó puntual y con uniforme completo',
    required: false,
  })
  observacion?: string;
}
