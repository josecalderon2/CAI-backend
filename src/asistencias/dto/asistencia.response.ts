import { ApiProperty } from '@nestjs/swagger';
import { EstadoAsistencia } from '@prisma/client';

export class AsistenciaResponse {
  @ApiProperty({ example: 1 })
  id_asistencia: number;

  @ApiProperty({ example: 12 })
  id_alumno: number;

  @ApiProperty({ example: 4 })
  id_asignatura: number;

  @ApiProperty({ example: 7 })
  id_orientador: number;

  @ApiProperty({
    example: '2025-10-22T00:00:00.000Z',
    description: 'Fecha del registro',
  })
  fecha: Date;

  @ApiProperty({
    enum: EstadoAsistencia,
    example: 'PRESENTE',
    description: 'Estado de asistencia',
  })
  estado: EstadoAsistencia;

  @ApiProperty({
    example: 'Llegó puntual y con uniforme completo',
    required: false,
  })
  observacion: string | null;

  @ApiProperty({
    example: '2025-10-22T12:00:00.000Z',
    description: 'Fecha y hora en que se creó el registro',
  })
  creadoEn: Date;

  @ApiProperty({
    description: 'Información básica del alumno',
    example: { id_alumno: 12, nombre: 'Manuel', apellido: 'López' },
  })
  alumno: any;

  @ApiProperty({
    description: 'Información de la asignatura',
    example: { id_asignatura: 4, nombre: 'Matemática' },
  })
  asignatura: any;

  @ApiProperty({
    description: 'Información del docente (orientador)',
    example: { id_orientador: 7, nombre: 'Ana', apellido: 'Martínez' },
  })
  orientador: any;
}
